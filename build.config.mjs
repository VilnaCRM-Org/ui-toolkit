import * as esbuild from 'esbuild';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const entryPoint = path.resolve(currentDir, 'src', 'components', 'index.ts');

const require = createRequire(import.meta.url);
const LocalizationGenerator = require('./scripts/localizationGenerator');

const localizationPlugin = {
  name: 'localization-plugin',
  setup(build) {
    build.onStart(async () => {
      try {
        const localizationGenerator = new LocalizationGenerator();
        localizationGenerator.generateLocalizationFile();
      } catch (error) {
        process.stderr.write(
          `Localization generation failed during build startup: ${error.message ?? error}\n`
        );
        throw error;
      }
    });
  },
};

if (!existsSync(entryPoint)) {
  process.stdout.write(
    'Skipping build because this bootstrap PR does not include src/components/index.ts yet.\n'
  );
  process.exit(0);
}

async function generateTypeDeclarations() {
  // esbuild does not emit type declarations, so the library's published `.d.ts`
  // is produced in two steps: tsc emits per-file declarations (keeping the `@/*`
  // path aliases) under temp/dts, then API Extractor rolls them into a single
  // self-contained build/index.d.ts (resolving the aliases and inlining internals).
  const tscBin = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tscBin, '-p', path.resolve(currentDir, 'tsconfig.dts.json')], {
    stdio: 'inherit',
    cwd: currentDir,
  });

  const { Extractor, ExtractorConfig } = await import('@microsoft/api-extractor');
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    path.resolve(currentDir, 'api-extractor.json')
  );
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: false,
  });
  if (!result.succeeded) {
    throw new Error(
      `API Extractor failed with ${result.errorCount} error(s) and ${result.warningCount} warning(s).`
    );
  }

  // Invariant: the rollup must be self-contained. Fail the build if any internal
  // `@/*` path-alias import leaked through instead of being inlined — such a file
  // would not resolve for consumers of the published package.
  const rollupPath = path.resolve(currentDir, 'build', 'index.d.ts');
  if (/\bfrom\s+['"]@\//.test(readFileSync(rollupPath, 'utf8'))) {
    throw new Error(
      'build/index.d.ts contains unresolved "@/..." path-alias imports; the API Extractor rollup did not inline them.'
    );
  }
}

esbuild
  .build({
    outdir: path.resolve(currentDir, 'build'),
    entryPoints: [entryPoint],
    entryNames: '[name]',
    bundle: true,
    minify: true,
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    // Externalize only peer dependencies — the consumer provides them. Swiper is a
    // direct dependency (not a peer), so it and its carousel CSS must stay bundled
    // into build/index.css (exported as `@vilnacrm/ui-toolkit/styles.css`); blanket
    // `packages: 'external'` would drop those required styles from the library.
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@mui/*',
      '@emotion/*',
      'react-hook-form',
      'i18next',
      'react-i18next',
    ],
    tsconfig: path.resolve(currentDir, 'tsconfig.json'),
    sourcemap: true,
    target: ['es2020'],
    loader: {
      '.js': 'jsx',
      '.svg': 'dataurl',
      '.css': 'css',
      '.ttf': 'file',
    },
    resolveExtensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.svg'],
    plugins: [localizationPlugin],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })
  .then(generateTypeDeclarations)
  .catch(error => {
    process.stderr.write(`Build failed: ${error.message ?? error}\n`);
    process.exit(1);
  });
