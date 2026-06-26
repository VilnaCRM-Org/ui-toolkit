import fs from 'node:fs';
import path from 'node:path';

import base from './stryker.config.mjs';

// CI runs mutation testing as MUTATION_SHARD_TOTAL parallel shards; this config
// mutates only shard MUTATION_SHARD_INDEX's deterministic slice of the file set.
const total = Math.max(1, Number.parseInt(process.env.MUTATION_SHARD_TOTAL ?? '1', 10) || 1);
const index = Math.max(0, Number.parseInt(process.env.MUTATION_SHARD_INDEX ?? '0', 10) || 0);

// Walk the same source the base `mutate` selects (src/components/**/*.tsx, minus
// stories) so a shard can never mutate a different set than an unsharded run.
function collectTsxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(full);
    if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.stories.tsx')) return [full];
    return [];
  });
}

// Round-robin assignment keeps shards disjoint and balanced. Sharding by file is
// mutation-score-preserving: each mutant runs against the full suite regardless
// of which shard owns its file, so the union of disjoint shards equals one full
// run. scripts/ci/merge-mutation-reports.ts re-enforces the real break gate over
// that union.
const sliced = collectTsxFiles('src/components')
  .sort()
  .filter((_, i) => i % total === index % total);

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
