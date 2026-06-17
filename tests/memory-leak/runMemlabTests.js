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

  const { runResult } = await run({
    scenario,
    consoleMode,
    workDir,
  });

  const analyzer = new StringAnalysis();
  await analyze(runResult, analyzer);

  runResult.cleanup();
}

async function runMemlabTests() {
  const testFilePaths = fs.readdirSync(scenariosDir).map(test => path.join(scenariosDir, test));

  await testFilePaths.reduce(
    (previousRun, testFilePath) => previousRun.then(() => runScenario(testFilePath)),
    Promise.resolve()
  );
}

runMemlabTests().catch(error => {
  throw error;
});
