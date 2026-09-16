import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { findPeerViolations, formatReport, peerCount } from './peer-compatibility-policy';

const PROJECT_ROOT = resolve(process.cwd());
const MANIFEST_PATH = resolve(PROJECT_ROOT, 'package.json');
const MODULES_ROOT = resolve(PROJECT_ROOT, 'node_modules');

function fail(code: 1 | 2, message: string): never {
  console.error(message);
  process.exit(code);
}

function readManifest(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function installedVersion(name: string): string | null {
  try {
    const manifest = readManifest(resolve(MODULES_ROOT, name, 'package.json'));
    const version =
      typeof manifest === 'object' && manifest !== null
        ? (manifest as Record<string, unknown>).version
        : undefined;
    return typeof version === 'string' ? version : null;
  } catch {
    return null;
  }
}

let pkg: unknown;
try {
  pkg = readManifest(MANIFEST_PATH);
} catch (error) {
  fail(2, `Failed to read or parse ${MANIFEST_PATH}: ${String(error)}`);
}

const declared = peerCount(pkg);
if (declared === 0) {
  fail(2, `${MANIFEST_PATH} declares no peerDependencies; refusing to report a vacuous pass.`);
}

const violations = findPeerViolations(pkg, installedVersion);

if (violations.length > 0) {
  console.error('package.json peer compatibility check failed:');
  console.error(formatReport(violations));
  console.error(
    'Every peerDependency needs a devDependency mirror whose floor and installed version satisfy ' +
      'the peer range. Widen the peer range in the same change, or hold the bump.'
  );
  process.exit(1);
}

console.log(`Every peerDependency (${declared}) is satisfied by its devDependency mirror.`);
