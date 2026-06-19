/**
 * CLI entry point for the caret (^) version-range policy.
 *
 * Reads this repository's own `package.json` and exits `0` when every dependency
 * range complies, `1` on a policy violation, and `2` when the manifest cannot be
 * read or parsed. See {@link ./dependencyRangePolicy.ts} for the rules.
 */
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { evaluatePackageJson } from './dependencyRangePolicy';

// The manifest filename is a fixed constant pointing at this repo's own
// package.json. We still resolve it against the project root and assert
// containment before reading: a defensive invariant that keeps the read
// provably scoped to the repository and satisfies the static path-traversal
// check, holding even if the source of the filename ever changes.
const PROJECT_ROOT = resolve(process.cwd());
const MANIFEST_PATH = resolve(PROJECT_ROOT, 'package.json');

const relativeToRoot = relative(PROJECT_ROOT, MANIFEST_PATH);
if (relativeToRoot === '' || relativeToRoot.startsWith('..') || isAbsolute(relativeToRoot)) {
  console.error(`Refusing to read a manifest outside the project root: ${MANIFEST_PATH}`);
  process.exit(2);
}

let pkg: unknown;

try {
  pkg = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch (error) {
  console.error(`Failed to read or parse ${MANIFEST_PATH}: ${String(error)}`);
  process.exit(2);
}

const { ok, report } = evaluatePackageJson(pkg);

if (ok) {
  console.log(report);
  process.exit(0);
}

console.error('package.json dependency range check failed:');
console.error(report);
console.error(
  'Every dependencies/devDependencies entry must use a caret (^) range. See CONTRIBUTING.md.'
);
process.exit(1);
