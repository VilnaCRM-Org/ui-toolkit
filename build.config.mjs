import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const LocalizationGenerator = require('./scripts/localizationGenerator');

const localizationPlugin = {
  name: 'localization-plugin',
  setup(build) {
    build.onStart(() => {
      const localizationGenerator = new LocalizationGenerator();
      localizationGenerator.generateLocalizationFile();
    });
  },
};

esbuild
  .build({
    outdir: path.resolve(__dirname, 'build'),
    entryPoints: [path.resolve(__dirname, 'src', 'components', 'index.ts')],
    entryNames: '[name]',
    bundle: true,
    minify: true,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
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
  .catch(() => process.exit(1));
