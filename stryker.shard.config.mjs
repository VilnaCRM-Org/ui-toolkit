import base from './stryker.config.mjs';
import { shardMutateFiles } from './scripts/ci/mutation-scope.mjs';

// CI runs mutation testing as MUTATION_SHARD_TOTAL parallel shards; this config
// mutates only shard MUTATION_SHARD_INDEX's deterministic slice of the file set.
const total = Math.max(1, Number.parseInt(process.env.MUTATION_SHARD_TOTAL ?? '1', 10) || 1);
const index = Math.max(0, Number.parseInt(process.env.MUTATION_SHARD_INDEX ?? '0', 10) || 0);

// A shard beyond the declared total would silently run a subset that no other
// shard covers, or duplicate another shard's slice — either way the merge in
// scripts/ci/merge-mutation-reports.ts would union an incomplete or skewed set
// without any signal that the CI matrix and this config had drifted apart.
if (index >= total) {
  throw new Error(
    `MUTATION_SHARD_INDEX (${index}) must be less than MUTATION_SHARD_TOTAL (${total}).`
  );
}

// Byte-weighted longest-processing-time bin packing (see mutation-scope.mjs);
// sharding by file is mutation-score-preserving regardless of how the split is
// balanced: a mutant's related-test set is derived from the mutated file, so
// it is identical no matter which shard owns that file, and the union of
// disjoint shards equals one full run.
// scripts/ci/merge-mutation-reports.ts re-enforces the real break gate over
// that union.
const sliced = shardMutateFiles(total, index);

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  ...base,
  // Match the canonical run's concurrency exactly. A higher value could, under
  // CPU contention, turn a would-be Survived mutant into a Timeout (counted as
  // detected) and inflate the merged score — a non-score-preserving leniency the
  // gate must not introduce. Speed comes from sharding across runners, not from
  // raising per-shard concurrency.
  concurrency: base.concurrency,
  mutate: sliced,
  reporters: ['json', 'clear-text', 'progress'],
  jsonReporter: { fileName: `reports/mutation/mutation-shard-${index}.json` },
  // A shard must never gate on its own partial slice. The real high:90 / break:80
  // gate (stryker.config.mjs) is re-enforced once, over the union of all shards,
  // by scripts/ci/merge-mutation-reports.ts. This is not a threshold change.
  thresholds: { ...base.thresholds, break: null },
};

export default config;
