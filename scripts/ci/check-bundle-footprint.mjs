import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateBundleFootprint, formatFootprintReport } from './bundle-footprint.mjs';

export function directoryBytes(directory) {
  let bytes = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    bytes += entry.isDirectory() ? directoryBytes(file) : statSync(file).size;
  }
  return bytes;
}

export function assertBundleFootprint({ metafile, budgetPath, buildDir }) {
  const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
  const buildBytes = directoryBytes(buildDir);
  const report = evaluateBundleFootprint(metafile, budget, buildBytes);
  process.stdout.write(`${formatFootprintReport(report, buildBytes)}\n`);
  if (report.violations.length > 0) {
    throw new Error(
      `${report.violations.length} bundle footprint violation(s); adjust the build or, for an intended change, config/bundle-budget.json`
    );
  }
}

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index + 1 >= process.argv.length) {
    throw new Error(
      `usage: check-bundle-footprint.mjs --metafile <json> --budget <json> --build-dir <dir>`
    );
  }
  return process.argv[index + 1];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assertBundleFootprint({
      metafile: JSON.parse(readFileSync(argument('--metafile'), 'utf8')),
      budgetPath: argument('--budget'),
      buildDir: argument('--build-dir'),
    });
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
