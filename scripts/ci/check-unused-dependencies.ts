/**
 * CLI entry point for the unused-dependency gate.
 *
 * Reads the `package.json` of the current working directory and scans the source
 * tree beside it for a mention of every declared package, so a dependency whose
 * last consumer disappeared fails the build instead of accumulating silently.
 * Exits `0` when every dependency is referenced, `1` when one is not, and `2`
 * when the manifest or the scan corpus cannot be read. See
 * {@link ./unused-dependency-policy.ts} for the rules.
 *
 * Usage: `bun scripts/ci/check-unused-dependencies.ts` — it takes no arguments
 * and always scans the working directory (the repository root under the
 * Makefile); the Bats suite exercises fixture trees by changing into them.
 *
 * The corpus is the git index when the tree has one, and a filesystem walk
 * otherwise — the case inside the bun image, whose build context excludes
 * `.git`. Both paths apply the same skip rules below, so a run in the container
 * sees the same source set CI's clean checkout produces. A tree that has a git
 * index but no git binary exits `2` rather than walking, because the walk would
 * also see untracked files and silently diverge from CI.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { evaluatePackageJson } from './unused-dependency-policy';

const BASE_DIR = process.cwd();

/** The one root every manifest, listing, and corpus read resolves inside. */
const SCAN_ROOT = resolve(BASE_DIR);

/**
 * Absolute git locations, in lookup order. The gate resolves the binary from
 * this fixed list of non-writable install paths rather than through PATH, whose
 * contents the surrounding environment controls.
 */
const GIT_BINARIES = ['/usr/bin/git', '/usr/local/bin/git', '/opt/homebrew/bin/git'];

/**
 * Directories that must never enter the corpus: installed packages and tool
 * output would name half the registry, agent session state (`.claude/`,
 * `.ralph/`, the BMAD trees) is transcript rather than source and never part of
 * a checkout, and `specs/` holds planning prose — a package named only in a
 * design document is not a package in use.
 */
const SKIPPED_DIRECTORIES = new Set([
  '_bmad',
  'bmalph',
  '.claude',
  '.git',
  '.lighthouseci',
  '.playwright-mcp',
  '.qlty',
  '.ralph',
  '.stryker-tmp',
  'build',
  'coverage',
  'dist',
  'lhci-reports-desktop',
  'lhci-reports-mobile',
  'node_modules',
  'playwright-report',
  'reports',
  'specs',
  'storybook-static',
  'temp',
  'test-results',
]);

/**
 * The manifest declares the packages and the lockfile names every transitive
 * one, so either file would mark the whole dependency set as used.
 */
const EXCLUDED_FILES = new Set(['package.json', 'bun.lock']);

/**
 * TypeScript's incremental build artifact records every `node_modules` path the
 * compiler read, so scanning it would report most of the manifest as used. It is
 * git-ignored but still lands in the bun image's build context.
 */
const GENERATED_INDEX_FILE = /\.tsbuildinfo$/;

/** Binary assets cannot reference a package by name, so reading them is pure I/O cost. */
const BINARY_FILE = /\.(png|jpe?g|gif|webp|ico|svg|ttf|otf|woff2?|pdf|zip|mp4)$/i;

/**
 * Prose and environment files can name a package without using it — a README
 * discussing a removed dependency, or an env value whose URL path spells a
 * package name — so a mention there must not keep a dependency alive.
 */
const PROSE_OR_ENV_FILE = /\.(md|markdown)$|(^|\/)\.env(\..+)?$/i;

function isScannable(relativePath: string): boolean {
  if (EXCLUDED_FILES.has(relativePath)) return false;
  if (BINARY_FILE.test(relativePath)) return false;
  if (GENERATED_INDEX_FILE.test(relativePath)) return false;
  if (PROSE_OR_ENV_FILE.test(relativePath)) return false;

  return !relativePath.split('/').some(segment => SKIPPED_DIRECTORIES.has(segment));
}

/**
 * Returns `absolutePath` once it is proven to sit at or under {@link SCAN_ROOT}.
 * Every path handed to the filesystem already comes from a listing rooted there;
 * this is the belt-and-braces invariant that keeps the scan provably inside the
 * tree even if a listing source ever changes. The comparison uses real paths so
 * a tracked symlink cannot smuggle content from outside the tree into the
 * corpus.
 */
function insideScanRoot(absolutePath: string): string {
  const realRoot = realpathSync(SCAN_ROOT);
  const realPath = realpathSync(absolutePath);

  if (realPath !== realRoot && !realPath.startsWith(realRoot + sep)) {
    throw new Error(`Refusing to read a path outside the scan root: ${absolutePath}`);
  }

  return realPath;
}

/** The first installed git binary, or `undefined` when the host has none. */
function findGitBinary(): string | undefined {
  return GIT_BINARIES.find(candidate => existsSync(candidate));
}

/** Lists the repository's tracked files, relative to {@link SCAN_ROOT}. */
function listTrackedFiles(gitBinary: string): string[] {
  const stdout = execFileSync(gitBinary, ['ls-files', '-z'], {
    cwd: SCAN_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  return stdout.split('\0').filter(entry => entry !== '');
}

/** Lists every file under {@link SCAN_ROOT} — the fallback when there is no git index to read. */
function walkFiles(relativeDir: string): string[] {
  const directory = insideScanRoot(resolve(SCAN_ROOT, relativeDir));

  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relativePath = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`;

    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : walkFiles(relativePath);
    }

    return entry.isFile() ? [relativePath] : [];
  });
}

function listScannableFiles(): string[] {
  if (!existsSync(join(SCAN_ROOT, '.git'))) {
    return walkFiles('').filter(isScannable);
  }

  // With a git index present the walk would see untracked and git-ignored
  // files the CI checkout never has, so a missing binary fails closed instead
  // of producing a silently divergent corpus.
  const gitBinary = findGitBinary();
  if (gitBinary === undefined) {
    throw new Error(
      `The tree has a .git index but no git binary exists at: ${GIT_BINARIES.join(', ')}`
    );
  }

  return listTrackedFiles(gitBinary).filter(isScannable);
}

function readCorpus(relativePaths: string[]): string[] {
  return relativePaths.map(relativePath =>
    readFileSync(insideScanRoot(resolve(SCAN_ROOT, relativePath)), 'utf8')
  );
}

const MANIFEST_PATH = resolve(SCAN_ROOT, 'package.json');

let pkg: unknown;

try {
  pkg = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (error) {
  console.error(`Failed to read or parse ${MANIFEST_PATH}: ${String(error)}`);
  process.exit(2);
}

let corpus: string[];

try {
  corpus = readCorpus(listScannableFiles());
} catch (error) {
  console.error(`Failed to build the scan corpus under ${SCAN_ROOT}: ${String(error)}`);
  process.exit(2);
}

const { ok, report } = evaluatePackageJson(pkg, corpus);

if (ok) {
  console.log(report);
  process.exit(0);
}

console.error('package.json unused dependency check failed:');
console.error(report);
console.error(
  'Remove the package, or — only when it resolves through an alias, a bin name, or a ' +
    'convention-named config — add a documented entry to IMPLICITLY_RESOLVED in ' +
    'scripts/ci/unused-dependency-policy.ts.'
);
process.exit(1);
