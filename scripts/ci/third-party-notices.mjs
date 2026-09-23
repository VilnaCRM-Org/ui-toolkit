import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const NOTICES_FILE = 'THIRD-PARTY-NOTICES.txt';

const PACKAGE_DIR = /^.*node_modules\/(?:@[^/]+\/)?[^/]+/;
const LICENSE_FILE = /^(?:licen[cs]e|copying)(?:[.-][\w.-]+)?$/i;
const SEPARATOR = `\n\n${'-'.repeat(72)}\n\n`;
const HEADER =
  '@vilnacrm/ui-toolkit bundles the third-party packages below into its build output. ' +
  'Each is redistributed under its own licence, reproduced in full.';

export function bundledPackageDirs(metafile) {
  const dirs = Object.keys(metafile.inputs)
    .map(input => PACKAGE_DIR.exec(input.replace(/\\/g, '/'))?.[0])
    .filter(dir => dir !== undefined);
  return [...new Set(dirs)].sort((a, b) => a.localeCompare(b));
}

function licenseText(packageDir) {
  const file = readdirSync(packageDir).find(name => LICENSE_FILE.test(name));
  if (file === undefined) {
    throw new Error(`${packageDir} ships no licence file, so its notice cannot be carried`);
  }
  return readFileSync(path.join(packageDir, file), 'utf8').trim();
}

function noticeFor(rootDir, packageDir) {
  const absolute = path.join(rootDir, packageDir);
  const manifest = JSON.parse(readFileSync(path.join(absolute, 'package.json'), 'utf8'));
  const heading = `${manifest.name}@${manifest.version} (${manifest.license})`;
  return `${heading}\n\n${licenseText(absolute)}`;
}

export function writeThirdPartyNotices({ metafile, buildDir, rootDir }) {
  const notices = bundledPackageDirs(metafile).map(dir => noticeFor(rootDir, dir));
  writeFileSync(path.join(buildDir, NOTICES_FILE), `${[HEADER, ...notices].join(SEPARATOR)}\n`);
  return notices.length;
}
