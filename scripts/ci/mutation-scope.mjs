// Single source of truth for the Stryker "mutate" file set.
//
// Before this file existed, stryker.config.mjs held a glob
// ('./src/components/**/*.tsx', minus '*.stories.tsx') and
// stryker.shard.config.mjs re-derived the same set with its own filesystem
// walk so it could split it into shards. Two independent definitions of "the
// mutated files" can drift silently — a file added on one side and missed on
// the other would drop mutants out of the merged score with no error, no
// warning, just a quietly smaller denominator. Both configs now import from
// here instead, so there is exactly one place that decides what gets mutated.

import fs from 'node:fs';
import path from 'node:path';

const MUTATE_ROOT = 'src/components';

// Plain code-unit comparator, NOT String.prototype.localeCompare: this
// tiebreak decides shard membership (see shardMutateFiles below), and a
// locale-aware compare can order the same two paths differently depending on
// the machine's locale. Every runner must compute the identical split.
function compareCodeUnits(a, b) {
  return a < b ? -1 : 1;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.stories.tsx')) return [full];
    return [];
  });
}

/**
 * Every mutated file: all `src/components/**\/*.tsx` except `*.stories.tsx`,
 * matching the glob `['./src/components/**\/*.tsx',
 * '!./src/components/**\/*.stories.tsx']` this replaces. Sorted with
 * {@link compareCodeUnits}.
 */
export function collectMutateFiles() {
  return walk(MUTATE_ROOT).sort(compareCodeUnits);
}

/**
 * Splits collectMutateFiles() into `total` deterministic shards weighted by
 * on-disk byte size (a proxy for mutant count: bigger files produce more
 * mutants) and returns shard `index`.
 *
 * Longest-processing-time bin packing: sort files heaviest-first (ties broken
 * by {@link compareCodeUnits} for determinism), then repeatedly drop the next
 * file onto whichever shard currently carries the least total weight.
 *
 * WHY: a sharded run costs whatever its slowest shard costs, so balancing
 * shard COUNT (round robin) is the wrong objective — balancing shard WEIGHT
 * is. Round robin was measured leaving the worst of 4 shards at 72 minutes
 * against a best of 23 minutes (3.2x spread) on the same 750-mutant run;
 * LPT bin packing minimizes exactly that kind of spread.
 *
 * INVARIANT: for a fixed `total`, the union of shardMutateFiles(total, i) over
 * every i in [0, total) equals collectMutateFiles() exactly — every file
 * assigned to precisely one shard, none dropped, none duplicated.
 */
export function shardMutateFiles(total, index) {
  if (!Number.isInteger(total) || total < 1) {
    throw new RangeError(`total must be a positive integer, got ${total}`);
  }
  if (!Number.isInteger(index) || index < 0 || index >= total) {
    throw new RangeError(`index must be an integer in [0, ${total}), got ${index}`);
  }

  const weighted = collectMutateFiles()
    .map(file => ({ file, size: fs.statSync(file).size }))
    .sort((a, b) => b.size - a.size || compareCodeUnits(a.file, b.file));

  const shards = Array.from({ length: total }, () => ({ files: [], weight: 0 }));
  for (const { file, size } of weighted) {
    // Strict `<` keeps the FIRST shard at the minimum weight, so packing stays
    // deterministic when several shards are equally light (e.g. all at 0 for
    // the first `total` files). The seed is shards[0] rather than an implicit
    // first element: `total >= 1` is already validated above, but a seedless
    // reduce() throws on an empty array, and this is the one line where that
    // would surface as a crash instead of a bad split.
    const lightest = shards.reduce(
      (min, shard) => (shard.weight < min.weight ? shard : min),
      shards[0]
    );
    lightest.files.push(file);
    lightest.weight += size;
  }

  return shards[index].files.sort(compareCodeUnits);
}
