/**
 * Pure helpers for merging Stryker shard reports and computing the mutation-score
 * gate exactly as Stryker does, so that a sharded CI run enforces the identical
 * `thresholds.break` an unsharded `stryker run` would.
 *
 * Stryker breaks the build when `systemUnderTestMetrics.metrics.mutationScore` is
 * below `thresholds.break` (see `@stryker-mutator/core`
 * `reporters/mutation-test-report-helper.ts#determineExitCode`). That score, per
 * `mutation-testing-metrics`, is computed only from the *source* files (the report
 * `files` map — `testFiles` are excluded) as:
 *
 *   detected   = killed + timeout
 *   undetected = survived + noCoverage
 *   valid      = detected + undetected
 *   mutationScore = valid > 0 ? (detected / valid) * 100 : NaN
 *
 * Invalid mutants (compile/runtime errors) and ignored mutants are excluded from
 * both numerator and denominator. Sharding by source file is score-preserving:
 * every mutant is run against the full test suite regardless of which shard owns
 * its file, so the union of disjoint shards equals one unsharded run.
 */

/** A single mutant entry in a `mutation-testing-elements` JSON report. */
export interface ReportMutant {
  status?: string;
}

/** A source file entry (the system under test) in a mutation report. */
export interface ReportFile {
  mutants?: ReportMutant[];
}

/** The subset of the `mutation-testing-elements` schema this gate reads. */
export interface MutationReport {
  files?: Record<string, ReportFile>;
}

/** Per-status mutant counts plus the derived detected/undetected/valid totals. */
export interface StatusTally {
  killed: number;
  timeout: number;
  survived: number;
  noCoverage: number;
  compileError: number;
  runtimeError: number;
  ignored: number;
  pending: number;
  detected: number;
  undetected: number;
  valid: number;
}

/** The merged score over a set of shard reports. */
export interface ScoreResult {
  tally: StatusTally;
  /** Number of distinct source files contributing mutants. */
  fileCount: number;
  /** The overall mutation score, or `NaN` when there are no valid mutants. */
  mutationScore: number;
}

/**
 * Union the `files` maps of every shard report, keyed by source path. Shards are
 * disjoint by construction; if the same path somehow appears twice the first
 * occurrence wins, which keeps mutants from being double-counted.
 */
export function mergeReportFiles(reports: readonly MutationReport[]): Map<string, ReportMutant[]> {
  const byFile = new Map<string, ReportMutant[]>();
  for (const report of reports) {
    for (const [path, file] of Object.entries(report.files ?? {})) {
      if (!byFile.has(path)) {
        byFile.set(path, file?.mutants ?? []);
      }
    }
  }
  return byFile;
}

/** Map each Stryker mutant status to its tally counter. */
const STATUS_TALLY_KEYS = new Map<string, keyof StatusTally>([
  ['Killed', 'killed'],
  ['Timeout', 'timeout'],
  ['Survived', 'survived'],
  ['NoCoverage', 'noCoverage'],
  ['CompileError', 'compileError'],
  ['RuntimeError', 'runtimeError'],
  ['Ignored', 'ignored'],
]);

/** Tally mutant statuses across the merged source files. */
export function tallyMutants(mutantsByFile: ReadonlyMap<string, ReportMutant[]>): StatusTally {
  const tally: StatusTally = {
    killed: 0,
    timeout: 0,
    survived: 0,
    noCoverage: 0,
    compileError: 0,
    runtimeError: 0,
    ignored: 0,
    pending: 0,
    detected: 0,
    undetected: 0,
    valid: 0,
  };

  for (const mutants of mutantsByFile.values()) {
    for (const mutant of mutants) {
      const key = mutant.status === undefined ? undefined : STATUS_TALLY_KEYS.get(mutant.status);
      if (key === undefined) {
        // `Pending` or any unrecognised status: not a settled, valid result.
        tally.pending += 1;
      } else {
        tally[key] += 1;
      }
    }
  }

  tally.detected = tally.killed + tally.timeout;
  tally.undetected = tally.survived + tally.noCoverage;
  tally.valid = tally.detected + tally.undetected;
  return tally;
}

/** The overall mutation score for a tally, or `NaN` when no valid mutants exist. */
export function mutationScore(tally: StatusTally): number {
  return tally.valid > 0 ? (tally.detected / tally.valid) * 100 : Number.NaN;
}

/** Merge shard reports and compute the overall mutation score. */
export function scoreReports(reports: readonly MutationReport[]): ScoreResult {
  const byFile = mergeReportFiles(reports);
  const tally = tallyMutants(byFile);
  return { tally, fileCount: byFile.size, mutationScore: mutationScore(tally) };
}
