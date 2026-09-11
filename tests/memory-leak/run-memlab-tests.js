const fs = require('node:fs');
const path = require('node:path');

const { run, analyze } = require('@memlab/api');
const { StringAnalysis } = require('@memlab/heap-analysis');

// Resolve scenario + work dirs from this module's location so the runner works
// regardless of the process CWD (readdir is CWD-relative, require is
// module-relative — keeping both on __dirname removes that mismatch).
const scenariosDir = path.join(__dirname, 'tests');
const workDir = path.join(__dirname, 'results');
const consoleMode = 'VERBOSE';

async function runScenario(testFilePath) {
  const scenario = require(testFilePath);

  const { leaks, runResult } = await run({
    scenario,
    consoleMode,
    workDir,
  });

  const analyzer = new StringAnalysis();
  await analyze(runResult, analyzer);

  runResult.cleanup();

  return leaks.length;
}

function collectLeaks(previousRun, testFilePath) {
  return previousRun.then(async leakingScenarios => {
    const leakCount = await runScenario(testFilePath);
    if (leakCount === 0) {
      return leakingScenarios;
    }
    return [...leakingScenarios, `${path.basename(testFilePath)} (${leakCount} leak(s))`];
  });
}

async function runMemlabTests() {
  const testFilePaths = fs
    .readdirSync(scenariosDir)
    .filter(entry => entry.endsWith('.js'))
    .map(test => path.join(scenariosDir, test));

  // Fail closed: an empty scenario directory means the gate measured nothing,
  // which must never be reported as a pass.
  if (testFilePaths.length === 0) {
    throw new Error(`No memlab scenarios found in ${scenariosDir}.`);
  }

  const leakingScenarios = await testFilePaths.reduce(collectLeaks, Promise.resolve([]));

  if (leakingScenarios.length > 0) {
    throw new Error(`Memory leaks detected in: ${leakingScenarios.join(', ')}`);
  }
}

runMemlabTests().catch(error => {
  throw error;
});
