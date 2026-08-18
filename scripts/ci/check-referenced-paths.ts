/**
 * Fail-closed guard against dead file references in the build and CI surface
 * (issue #96).
 *
 * The memory-leak gate stayed green for weeks while executing nothing because a
 * rename left `Makefile` and `.github/workflows/memory-leak-testing.yml`
 * pointing at `tests/memory-leak/runMemlabTests.js`, a file that no longer
 * existed. Nothing in the repository noticed. This check reads the same files a
 * human would, extracts every repository-relative path they name, and exits
 * non-zero when one of them is missing.
 *
 * Usage: `bun scripts/ci/check-referenced-paths.ts [file ...]`
 * With no arguments it scans the `Makefile` and every `.github/workflows/*.yml`.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());
const WORKFLOWS_DIR = resolve(PROJECT_ROOT, '.github/workflows');

// Interpolations are replaced by NUL before tokenising: `$(VAR)`, `${VAR}`,
// `${{ ctx }}` and `$VAR`/`$$VAR` name something this guard cannot resolve
// statically. NUL is neither a separator nor a legal path character, so the
// token carrying it fails the shape test whole instead of being sliced into an
// invented fragment such as `metrics/row-` or `-image.cyclonedx.json`.
const INTERPOLATION = /\$\{\{[^}]*\}\}|\$\{[^}]*\}|\$\([^)]*\)|\$+[A-Za-z_][A-Za-z0-9_]*/g;

// Comments are prose, not executed references, so a path named only in a
// comment is not something a build step can trip over.
const COMMENT = /(?:^|\s)#.*$/;

// YAML `name:` values are human labels. `calibreapp/image-actions` as a job
// name is not a directory, and no other key carries free text like that.
const YAML_LABEL = /^\s*(?:- )?name:\s/;

const TOKEN_SEPARATORS = /[\s'"`(),;=<>|&!?[\]]+/;

// A repository path: at least one `/`, a bare Dockerfile, or a root-level file
// with a known source/config extension. Anything else (globs, image refs, awk
// patterns, URLs) fails the shape test rather than being guessed at.
const SLASHED_PATH = /^(?:\.\/)?(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\/?$/;
const DOCKERFILE = /^Dockerfile(?:\.[A-Za-z0-9_-]+)?$/;
const ROOT_FILE = /^[A-Za-z0-9_.-]+\.(?:c?js|mjs|jsx|tsx?|json|sh|ya?ml|lock)$/;

// Directories produced by a run (or installed into) rather than committed. They
// are legitimately absent from a fresh checkout.
const GENERATED_ROOTS = new Set([
  '.git',
  '.lighthouseci',
  '.stryker-tmp',
  'base',
  'build',
  'codeql_databases',
  'coverage',
  'dist',
  'docker-perf',
  'metrics',
  'node_modules',
  'out',
  'playwright-report',
  'reports',
  'results',
  'sbom',
  'storybook-static',
  'temp',
  'test-results',
  'tmp',
]);

function normalise(token: string): string {
  return token.replace(/^\.\//, '').replace(/\/+$/, '');
}

function looksLikeRepositoryPath(token: string): boolean {
  if (!SLASHED_PATH.test(token) && !DOCKERFILE.test(token) && !ROOT_FILE.test(token)) {
    return false;
  }
  const path = normalise(token);
  if (path === '' || path.split('/').some(segment => segment === '' || segment === '..')) {
    return false;
  }
  return !GENERATED_ROOTS.has(path.split('/')[0]);
}

function scrub(line: string, isYaml: boolean): string {
  if (isYaml && YAML_LABEL.test(line)) {
    return '';
  }
  return line.replace(INTERPOLATION, '\u0000').replace(COMMENT, '');
}

function extractPaths(contents: string, isYaml: boolean): string[] {
  const found = new Set<string>();
  contents.split('\n').forEach(line => {
    scrub(line, isYaml)
      .split(TOKEN_SEPARATORS)
      .filter(looksLikeRepositoryPath)
      .forEach(token => found.add(normalise(token)));
  });
  return [...found];
}

function isInsideProject(candidate: string): boolean {
  const relativeToRoot = relative(PROJECT_ROOT, resolve(PROJECT_ROOT, candidate));
  return relativeToRoot !== '' && !relativeToRoot.startsWith('..') && !isAbsolute(relativeToRoot);
}

function defaultSources(): string[] {
  const workflows = existsSync(WORKFLOWS_DIR)
    ? readdirSync(WORKFLOWS_DIR)
        .filter(name => name.endsWith('.yml') || name.endsWith('.yaml'))
        .map(name => `.github/workflows/${name}`)
        .sort()
    : [];
  return ['Makefile', ...workflows];
}

type Violation = { source: string; path: string };

function auditSource(source: string): Violation[] {
  const isYaml = source.endsWith('.yml') || source.endsWith('.yaml');
  return extractPaths(readFileSync(resolve(PROJECT_ROOT, source), 'utf8'), isYaml)
    .filter(path => isInsideProject(path) && !existsSync(resolve(PROJECT_ROOT, path)))
    .sort()
    .map(path => ({ source, path }));
}

const sources = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultSources();

const missingSources = sources.filter(source => !existsSync(resolve(PROJECT_ROOT, source)));
if (missingSources.length > 0) {
  console.error(`Cannot audit missing source file(s): ${missingSources.join(', ')}`);
  process.exit(2);
}

// A scan that inspected nothing must never be reported as a pass.
if (sources.length === 0) {
  console.error('No sources to audit; refusing to report a vacuous pass.');
  process.exit(2);
}

const violations = sources.flatMap(auditSource);

if (violations.length > 0) {
  console.error('Referenced paths that do not exist:');
  violations.forEach(({ source, path }) => console.error(`  ${source} -> ${path}`));
  console.error(
    'Fix the reference or the file. A build or CI step that names a missing path can only ' +
      'fail late, or pass having done nothing.'
  );
  process.exit(1);
}

console.log(`Referenced-path check passed across ${sources.length} file(s).`);
