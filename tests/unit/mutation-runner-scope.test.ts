import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import jestUnitConfig from '../../jest.config';
import jestMutationConfig from '../../jest.mutation.config';

// The mutation run went from ~1h58m wall clock to a measured
// 1.83s/mutant by (a) turning on `jest.enableFindRelatedTests`, (b) excluding
// barrel-importing structural guards from the mutation tier so they cannot
// force every suite "related" to every mutant, and (c) replacing round-robin
// sharding with byte-weighted bin packing. None of that is enforced by Stryker
// itself — a well-meaning edit (flip the flag back, raise concurrency, widen
// the guard exclusion list, revert to round robin) would silently restore the
// slow run with every other gate still green. This suite pins each invariant
// directly against the real config/scope files so such an edit fails the build
// instead of the next CI run.
//
// `stryker.config.mjs` and `scripts/ci/mutation-scope.mjs` are genuine ES
// modules (`.mjs`); Jest here has no `--experimental-vm-modules`, so it can
// neither `require()` them (Node refuses `.mjs` via the CJS loader) nor run a
// top-level `await import()` of them (Jest throws "invoked without
// --experimental-vm-modules"). A real `node --input-type=module` subprocess
// needs no such flag, so this suite shells out once and reads the real,
// unmodified files' behaviour back as JSON.

const REPO_ROOT: string = resolve(__dirname, '..', '..');

const STRUCTURAL_GUARD_FILES: readonly string[] = [
  'tests/unit/components-index.test.ts',
  'tests/unit/ui-core-contract.test.tsx',
];

// Ratchet: `thresholds.break` may only ever climb. Bumping the floor here is
// how a deliberate increase gets recorded; a config edit that LOWERS the real
// value must fail this test rather than silently loosen the merge gate.
const MUTATION_BREAK_THRESHOLD_FLOOR = 80;

const SHARD_TOTALS_UNDER_TEST: readonly number[] = [1, 2, 4, 6, 7];

// Single- and double-quoted, with or without an explicit `/index` and a
// trailing slash — every variant resolves to the same barrel module. The
// `@/` alias counts too: jest.config.ts's moduleNameMapper maps `^@/(.*)$`
// to `<rootDir>/src/$1`, so an `@/components` specifier resolves to the same
// public barrel and would otherwise bypass this guard undetected. (Written
// here as `@/components`, not `from '...'`, so this comment doesn't trip the
// pattern it documents.)
const BARREL_IMPORT_PATTERN =
  /from ['"](?:(?:\.\.\/)+src\/components|@\/components)(?:\/index)?\/?['"]/;

interface StrykerJestOptions {
  configFile: string;
  enableFindRelatedTests: boolean;
}

interface StrykerThresholds {
  high: number;
  break: number;
}

interface StrykerConfigShape {
  coverageAnalysis: string;
  plugins: string[];
  checkers: string[];
  disableTypeChecks: boolean;
  tsconfigFile: string;
  concurrency: number;
  jest: StrykerJestOptions;
  mutate: string[];
  thresholds: StrykerThresholds;
}

interface RangeGuardOutcome {
  ok: boolean;
  name?: string;
}

interface RangeGuardResults {
  totalZero: RangeGuardOutcome;
  totalNegative: RangeGuardOutcome;
  totalNonInteger: RangeGuardOutcome;
  indexEqualsTotal: RangeGuardOutcome;
  indexNegative: RangeGuardOutcome;
  indexNonInteger: RangeGuardOutcome;
}

interface ProbeResult {
  strykerConfig: StrykerConfigShape;
  mutateFiles: string[];
  shards: Record<string, string[][]>;
  rangeGuards: RangeGuardResults;
  /** `${left}|${right}` -> compareCodeUnits(left, right), sampled in the probe. */
  comparator: Record<string, number>;
}

// Executed once (see `beforeAll` below) inside the real Node ESM loader: loads
// the two actual `.mjs` files and exercises every code path this suite pins,
// so every assertion below reads genuine output rather than a re-implementation.
const PROBE_SCRIPT = `
import strykerConfig from './stryker.config.mjs';
import {
  collectMutateFiles,
  compareCodeUnits,
  shardMutateFiles,
} from './scripts/ci/mutation-scope.mjs';

function tryCall(fn) {
  try {
    fn();
    return { ok: true };
  } catch (error) {
    return { ok: false, name: error && error.constructor && error.constructor.name };
  }
}

const shards = {};
for (const total of ${JSON.stringify(SHARD_TOTALS_UNDER_TEST)}) {
  shards[total] = Array.from({ length: total }, (_, i) => shardMutateFiles(total, i));
}

const comparator = {};
for (const [left, right] of [['Z', 'a'], ['B', 'a'], ['a', 'a']]) {
  comparator[left + '|' + right] = compareCodeUnits(left, right);
}

process.stdout.write(JSON.stringify({
  strykerConfig,
  mutateFiles: collectMutateFiles(),
  shards,
  comparator,
  rangeGuards: {
    totalZero: tryCall(() => shardMutateFiles(0, 0)),
    totalNegative: tryCall(() => shardMutateFiles(-1, 0)),
    totalNonInteger: tryCall(() => shardMutateFiles(1.5, 0)),
    indexEqualsTotal: tryCall(() => shardMutateFiles(6, 6)),
    indexNegative: tryCall(() => shardMutateFiles(6, -1)),
    indexNonInteger: tryCall(() => shardMutateFiles(6, 1.5)),
  },
}));
`;

// `envOverride` lets a caller run this exact script under a different
// environment without duplicating it.
function runProbe(envOverride?: Readonly<Record<string, string>>): ProbeResult {
  const stdout = execFileSync('node', ['--input-type=module'], {
    cwd: REPO_ROOT,
    input: PROBE_SCRIPT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    env: envOverride ? { ...process.env, ...envOverride } : process.env,
  });
  return JSON.parse(stdout) as ProbeResult;
}

// Separate script, not a shared one: `stryker.shard.config.mjs` reads
// MUTATION_SHARD_TOTAL/INDEX at import time, and ESM caches a module on first
// import, so the env must be set before THIS process's one import happens.
// One subprocess per (total, index) case is the simplest way to guarantee that.
const SHARD_WIRING_PROBE_SCRIPT = `
import shardConfig from './stryker.shard.config.mjs';
process.stdout.write(JSON.stringify(shardConfig.mutate));
`;

function runShardWiringProbe(total: number, index: number): string[] {
  const stdout = execFileSync('node', ['--input-type=module'], {
    cwd: REPO_ROOT,
    input: SHARD_WIRING_PROBE_SCRIPT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    env: {
      ...process.env,
      MUTATION_SHARD_TOTAL: String(total),
      MUTATION_SHARD_INDEX: String(index),
    },
  });
  return JSON.parse(stdout) as string[];
}

// Generic recursive walker, reused for both the independent src/components
// re-derivation (B) and the tests/ barrel-import audit (C) — a regression in
// one walk shape must not hide behind the other's assumptions.
function walkRelative(relDir: string): string[] {
  const absDir = join(REPO_ROOT, relDir);
  return readdirSync(absDir, { withFileTypes: true }).flatMap(entry => {
    const relPath = `${relDir}/${entry.name}`;
    return entry.isDirectory() ? walkRelative(relPath) : [relPath];
  });
}

function independentlyCollectMutateFiles(): string[] {
  return walkRelative('src/components')
    .filter(file => file.endsWith('.tsx') && !file.endsWith('.stories.tsx'))
    .sort();
}

function allSuiteFiles(): string[] {
  return walkRelative('tests').filter(file => /\.(test\.tsx?|spec\.js)$/.test(file));
}

function importsPublicBarrel(relPath: string): boolean {
  return BARREL_IMPORT_PATTERN.test(readFileSync(join(REPO_ROOT, relPath), 'utf8'));
}

// Narrow glob->RegExp translation, only for the shapes jest.config.ts's
// testMatch actually uses (<rootDir>/dir/**/*.test.ext) — not a general glob
// engine, so it needs no new dependency (and none is declared). '**/' becomes
// an OPTIONAL group: globstar semantics match zero directories too, so a file
// directly under `dir/` (no nesting) must still satisfy `dir/**/*.ext`.
function globSuffixToRegExp(globSuffix: string): RegExp {
  const globstarDirPlaceholder = 'GLOBSTAR_DIR_PLACEHOLDER';
  const withPlaceholder = globSuffix.split('**/').join(globstarDirPlaceholder);
  const escaped = withPlaceholder.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const singleStarsHandled = escaped.split('*').join('[^/]*');
  const restored = singleStarsHandled.split(globstarDirPlaceholder).join('(?:.*/)?');
  return new RegExp(`^${restored}$`);
}

// jest's `testMatch` accepts either a single glob or an array (the type Jest
// ships is `string | Array<string>`); normalize before scanning it.
function toPatternArray(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return [];
  // `typeof` (not Array.isArray) narrows a `readonly string[]` union member
  // reliably; Array.isArray's `arg is any[]` guard does not.
  return typeof value === 'string' ? [value] : value;
}

function matchesTestMatch(
  patterns: string | readonly string[] | undefined,
  relPath: string
): boolean {
  return toPatternArray(patterns).some(pattern => {
    if (!pattern.startsWith('<rootDir>/')) return false;
    return globSuffixToRegExp(pattern.slice('<rootDir>/'.length)).test(relPath);
  });
}

function fileSizesFor(files: readonly string[]): Map<string, number> {
  return new Map(files.map(file => [file, statSync(join(REPO_ROOT, file)).size]));
}

function shardWeight(files: readonly string[], sizes: ReadonlyMap<string, number>): number {
  return files.reduce((sum, file) => sum + (sizes.get(file) ?? 0), 0);
}

function roundRobinHeaviestWeight(
  files: readonly string[],
  sizes: ReadonlyMap<string, number>,
  total: number
): number {
  const weights = new Array<number>(total).fill(0);
  files.forEach((file, index) => {
    weights[index % total] += sizes.get(file) ?? 0;
  });
  return Math.max(...weights);
}

function stemOf(relPath: string): string {
  return basename(relPath).split('.')[0] ?? '';
}

function extractShardTotals(workflowText: string): number[] {
  const pattern = /MUTATION_SHARD_TOTAL:\s*'(\d+)'/g;
  return [...workflowText.matchAll(pattern)].map(m => Number(m[1]));
}

function extractMatrixIndices(workflowText: string): number[] {
  const match = /index:\s*\[([^\]]*)\]/.exec(workflowText);
  return match ? match[1].split(',').map(Number) : [];
}

let probe: ProbeResult;

beforeAll(() => {
  probe = runProbe();
});

describe('runner settings (stryker.config.mjs)', () => {
  it('finds related tests instead of reloading every suite per mutant', () => {
    // Flipping this back is exactly the regression measured at ~15.8s/mutant
    // (Jest resolving every suite before filtering by testNamePattern).
    expect(probe.strykerConfig.jest.enableFindRelatedTests).toBe(true);
  });

  it('wires the TypeScript checker plugin and checker', () => {
    expect(probe.strykerConfig.plugins).toContain('@stryker-mutator/typescript-checker');
    expect(probe.strykerConfig.checkers).toContain('typescript');
  });

  it('leaves type checks enabled (disableTypeChecks: true silently no-ops the checker)', () => {
    expect(probe.strykerConfig.disableTypeChecks).toBe(false);
  });

  it('scopes the checker to the narrowed src-only tsconfig', () => {
    expect(probe.strykerConfig.tsconfigFile).toBe('tsconfig.stryker.json');
  });

  it('keeps perTest coverage analysis and concurrency at 2', () => {
    // A higher concurrency can, under CPU contention, turn a would-be
    // Survived mutant into a Timeout and inflate the merged score.
    expect(probe.strykerConfig.coverageAnalysis).toBe('perTest');
    expect(probe.strykerConfig.concurrency).toBe(2);
  });

  it('never lets the break threshold drop below the recorded floor', () => {
    // Ratchet, not a pin: raising thresholds.break in the config needs no
    // edit here, but lowering it fails this assertion.
    expect(typeof probe.strykerConfig.thresholds.break).toBe('number');
    expect(probe.strykerConfig.thresholds.break).toBeGreaterThanOrEqual(
      MUTATION_BREAK_THRESHOLD_FLOOR
    );
  });
});

describe('mutate-scope integrity (scripts/ci/mutation-scope.mjs)', () => {
  it('collects a non-empty, sorted, duplicate-free file list', () => {
    const files = probe.mutateFiles;
    expect(files.length).toBeGreaterThan(0);
    expect(files).toEqual([...files].sort());
    expect(new Set(files).size).toBe(files.length);
  });

  it('collects only existing, non-story .tsx files', () => {
    const files = probe.mutateFiles;
    expect(files.every(file => file.endsWith('.tsx'))).toBe(true);
    expect(files.some(file => file.endsWith('.stories.tsx'))).toBe(false);
    expect(files.every(file => existsSync(join(REPO_ROOT, file)))).toBe(true);
  });

  it('matches an independent walk of src/components', () => {
    expect(probe.mutateFiles).toEqual(independentlyCollectMutateFiles());
  });

  it("stryker.config.mjs's mutate array deep-equals collectMutateFiles()", () => {
    expect(probe.strykerConfig.mutate).toEqual(probe.mutateFiles);
  });

  it.each(SHARD_TOTALS_UNDER_TEST)('exactly covers all files for total=%i', total => {
    const shards = probe.shards[String(total)] ?? [];
    const flat = shards.flat();
    expect(flat.length).toBe(probe.mutateFiles.length);
    expect(new Set(flat).size).toBe(probe.mutateFiles.length);
    expect([...flat].sort()).toEqual([...probe.mutateFiles].sort());
  });

  // The real 61-file set cannot distinguish the two orderings — every path is
  // lowercase ASCII, and code-unit and localeCompare agree on all 61. So the
  // file list can never catch a swap to localeCompare; the comparator has to be
  // pinned directly, on inputs where the two genuinely disagree.
  it.each([
    ['Z', 'a'],
    ['B', 'a'],
  ])('orders %s before %s by code unit, where localeCompare would not', (left, right) => {
    expect(probe.comparator[`${left}|${right}`]).toBeLessThan(0);
    expect(Math.sign(left.localeCompare(right))).toBeGreaterThan(0);
  });

  it('returns 0 for equal inputs, per the sort comparator contract', () => {
    expect(probe.comparator['a|a']).toBe(0);
  });

  it.each([
    ['total = 0', 'totalZero'],
    ['total = -1', 'totalNegative'],
    ['non-integer total', 'totalNonInteger'],
    ['index = total', 'indexEqualsTotal'],
    ['index = -1', 'indexNegative'],
    ['non-integer index', 'indexNonInteger'],
  ] as const)('throws a RangeError for %s', (_label, key) => {
    const outcome = probe.rangeGuards[key];
    expect(outcome.ok).toBe(false);
    expect(outcome.name).toBe('RangeError');
  });

  it("keeps the heaviest total=6 shard no worse than round robin's", () => {
    const files = probe.mutateFiles;
    const sizes = fileSizesFor(files);
    const binPacked = probe.shards['6'] ?? [];
    const heaviestBinPacked = Math.max(...binPacked.map(shard => shardWeight(shard, sizes)));
    const heaviestRoundRobin = roundRobinHeaviestWeight(files, sizes, 6);
    // Strict: equality would mean bin packing gave up nothing over round
    // robin, which is the regression (a silent revert to round robin) this
    // guard exists to catch.
    expect(heaviestBinPacked).toBeLessThan(heaviestRoundRobin);
  });
});

describe('structural-guard exclusion (jest.mutation.config.ts)', () => {
  it.each(STRUCTURAL_GUARD_FILES)('excludes %s from the mutation tier', file => {
    const ignorePatterns = jestMutationConfig.testPathIgnorePatterns ?? [];
    expect(ignorePatterns.some(pattern => pattern.includes(stemOf(file)))).toBe(true);
  });

  it("still ignores node_modules (naming the option replaces Jest's default)", () => {
    expect(jestMutationConfig.testPathIgnorePatterns).toContain('/node_modules/');
  });

  it.each(STRUCTURAL_GUARD_FILES)('%s still exists and still runs in the unit gate', file => {
    expect(existsSync(join(REPO_ROOT, file))).toBe(true);
    expect(matchesTestMatch(jestUnitConfig.testMatch, file)).toBe(true);
  });

  it.each(STRUCTURAL_GUARD_FILES)('%s is excluded BECAUSE it imports the public barrel', file => {
    expect(importsPublicBarrel(file)).toBe(true);
  });

  it('no other suite under tests/ imports the public barrel', () => {
    const barrelImporters = allSuiteFiles().filter(importsPublicBarrel).sort();
    expect(barrelImporters).toEqual([...STRUCTURAL_GUARD_FILES].sort());
  });
});

// The suites above pin shardMutateFiles() in isolation. Neither one checks
// that stryker.shard.config.mjs actually calls it, nor that the CI matrix
// agrees with MUTATION_SHARD_TOTAL — the exact drift the workflow's own
// lock-step comment warns about but nothing previously enforced.
describe('shard wiring (stryker.shard.config.mjs + CI matrix agree)', () => {
  it("stryker.shard.config.mjs's mutate array is shardMutateFiles(total, index)", () => {
    const wired = runShardWiringProbe(6, 2);
    expect(wired).toEqual(probe.shards['6']?.[2] ?? []);
  });

  it('keeps MUTATION_SHARD_TOTAL and the index matrix in lock-step', () => {
    const text = readFileSync(join(REPO_ROOT, '.github/workflows/mutation-testing.yml'), 'utf8');
    const totals = extractShardTotals(text);
    expect(totals.length).toBeGreaterThan(0);
    expect(new Set(totals).size).toBe(1);

    const total = totals[0] ?? 0;
    const indices = extractMatrixIndices(text).sort((a, b) => a - b);
    expect(indices).toEqual(Array.from({ length: total }, (_, i) => i));
  });
});
