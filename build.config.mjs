import * as esbuild from 'esbuild';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

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
  .catch(error => {
    process.stderr.write(`esbuild failed: ${error.message ?? error}\n`);
    process.exit(1);
  });
