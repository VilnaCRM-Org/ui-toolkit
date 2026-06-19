import { readFileSync } from 'node:fs';
import { evaluatePackageJson } from './dependencyRangePolicy';

// Always validates this repo's own manifest, resolved against the process cwd.
// The path is a fixed constant (no CLI/user input) so it cannot be redirected
// to read arbitrary files.
const MANIFEST_PATH = 'package.json';

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
