/**
 * CLI entry point for the unused-dependency gate.
 *
 * Reads a `package.json` and scans the source tree beside it for a mention of
 * every declared package, so a dependency whose last consumer disappeared fails
 * the build instead of accumulating silently. Exits `0` when every dependency is
 * referenced, `1` when one is not, and `2` when the manifest or the scan corpus
 * cannot be read. See {@link ./unused-dependency-policy.ts} for the rules.
 *
 * Usage: `bun scripts/ci/check-unused-dependencies.ts [base-dir]`
 *
 * `base-dir` defaults to the working directory (the repository root under the
 * Makefile). It exists so the Bats suite can point the gate at a fixture tree;
 * every read stays rooted at it.
 *
 * The corpus is the git index when the tree has one, and a filesystem walk
 * otherwise — the case inside the bun image, whose build context excludes
 * `.git`. Both paths apply the same skip rules below, so a run in the container
 * sees the same source set CI's clean checkout produces.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { evaluatePackageJson } from './unused-dependency-policy';

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

/** Lists the repository's tracked files, relative to `baseDir`. */
function listTrackedFiles(baseDir: string): string[] {
  const stdout = execFileSync('git', ['ls-files', '-z'], {
    cwd: baseDir,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  return stdout.split('\0').filter(entry => entry !== '');
}

/** Lists every file under `baseDir` — the fallback for a fixture tree with no git index. */
function walkFiles(baseDir: string, relativeDir: string): string[] {
  return readdirSync(join(baseDir, relativeDir), { withFileTypes: true }).flatMap(entry => {
    const relativePath = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`;

    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : walkFiles(baseDir, relativePath);
    }

    return entry.isFile() ? [relativePath] : [];
  });
}

function listScannableFiles(baseDir: string): string[] {
  const paths = existsSync(join(baseDir, '.git'))
    ? listTrackedFiles(baseDir)
    : walkFiles(baseDir, '');

  return paths.filter(isScannable);
}

function readCorpus(baseDir: string, relativePaths: string[]): string[] {
  return relativePaths.map(relativePath => {
    const absolutePath = resolve(baseDir, relativePath);

    // Every path already comes from a listing rooted at baseDir. Re-assert
    // containment before reading so the scan stays provably inside the tree
    // even if the listing source ever changes.
    const inside = relative(baseDir, absolutePath);
    if (inside === '' || inside.startsWith('..') || isAbsolute(inside)) {
      throw new Error(`Refusing to read a file outside the scan root: ${absolutePath}`);
    }

    return readFileSync(absolutePath, 'utf8');
  });
}

const BASE_DIR = resolve(process.argv[2] ?? process.cwd());
const MANIFEST_PATH = resolve(BASE_DIR, 'package.json');

let pkg: unknown;

try {
  pkg = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (error) {
  console.error(`Failed to read or parse ${MANIFEST_PATH}: ${String(error)}`);
  process.exit(2);
}

let corpus: string[];

try {
  corpus = readCorpus(BASE_DIR, listScannableFiles(BASE_DIR));
} catch (error) {
  console.error(`Failed to build the scan corpus under ${BASE_DIR}: ${String(error)}`);
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
