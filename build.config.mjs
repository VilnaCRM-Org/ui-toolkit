import * as esbuild from 'esbuild';
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';

import { assertBundleFootprint } from './scripts/ci/check-bundle-footprint.mjs';
import { writeThirdPartyNotices } from './scripts/ci/third-party-notices.mjs';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const entryPoint = path.resolve(currentDir, 'src', 'components', 'index.ts');
const LOCALES = 'locales';
const localesEntry = path.resolve(currentDir, 'src', LOCALES, 'index.ts');
const ALIAS_IMPORT = /(?:\bfrom\s+|\bimport\s*(?:\(\s*)?)['"]@\//;

const require = createRequire(import.meta.url);

// Every VALUE re-export in the public barrel becomes its own entry point.
//
// This is not cosmetic packaging. Thirteen modules call `createTheme` /
// `createBreakpoints` at module scope, and a bundler cannot prove those calls
// pure — bundled into one file they are top-level statements every importer has
// to retain, so pulling `UiButton` dragged every theme in the kit with it.
// (esbuild's `pure` does not help: it feeds esbuild's own DCE and emits no
// `@__PURE__` annotation for the consumer's bundler.) One entry per component
// puts each of those calls behind an import the consumer can simply not make.
//
// Derived from `index.ts` rather than from the directory listing, so the entry
// set and the public surface cannot drift: a component that is not exported is
// not published, and one that is gets its subpath automatically.
function componentEntryPoints() {
  const barrel = readFileSync(entryPoint, 'utf8');
  const directories = new Set();
  // `export { … } from './x'` only. `export type { … }` is erased at runtime and
  // needs no entry — its declarations ride the shared rollup.
  for (const match of barrel.matchAll(/^export \{[^}]*\} from '\.\/([^']+)'/gm)) {
    directories.add(match[1].split('/')[0]);
  }

  const entryPoints = { index: entryPoint };
  for (const directory of directories) {
    const base = path.resolve(currentDir, 'src', 'components', directory, 'index');
    const source = ['.tsx', '.ts'].map(extension => `${base}${extension}`).find(existsSync);
    if (source) {
      entryPoints[directory] = source;
    }
  }
  entryPoints[LOCALES] = localesEntry;
  return entryPoints;
}

// The names the barrel re-exports from one component directory, split by whether
// they survive to runtime. Used to give each subpath a `.d.mts` whose shape
// matches its `.mjs` exactly.
function barrelNamesFor(barrel, directory) {
  const escaped = directory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const from = `from '\\./${escaped}(?:/[^']+)?'`;
  const defaultAs = new RegExp(`export \\{ default as (\\w+) \\} ${from}`).exec(barrel);
  const values = [];
  const types = [];
  for (const match of barrel.matchAll(new RegExp(`export (type )?\\{([^}]*)\\} ${from}`, 'g'))) {
    for (const specifier of match[2].split(',')) {
      const name = specifier.trim();
      if (!name || name.startsWith('default as')) continue;
      (match[1] ? types : values).push(name);
    }
  }
  return { defaultExport: defaultAs ? defaultAs[1] : null, values, types };
}

// The names a built subpath actually exports, taken from esbuild's own metafile.
//
// NOT scanned back out of the emitted text. This build is `minify: true`, so
// esbuild writes each entry as a single line —
// `import{a}from"./chunks/chunk-….mjs";…;export{a as default};` — which offers a
// line-anchored scan no `^` to match and no space after `export` to key on. The
// previous regex therefore found nothing, read that as "the module exports
// nothing", and failed the build on the first subpath it checked. `make build`
// and `make package` have been broken that way since the check landed, and no
// workflow ran either target, so nothing noticed until a release tried to pack.
//
// `metafile.outputs[<file>].exports` is esbuild's structured record of what it
// emitted, so it stays correct whatever the minifier does to the source text.
function runtimeExportsOf(directory, metafile) {
  const suffix = `/${directory}.mjs`;
  const output = Object.entries(metafile.outputs).find(
    ([file, meta]) => meta.entryPoint !== undefined && file.endsWith(suffix)
  );
  // Every directory reaching this point was handed to esbuild as an entry point,
  // so a miss means the build's own bookkeeping disagrees with itself. Failing
  // closed is the whole point of the check below.
  if (output === undefined) {
    throw new Error(
      `esbuild emitted no entry output for the '${directory}' subpath, so its ` +
        'declarations cannot be checked against anything.'
    );
  }
  return output[1].exports;
}

// Fails the build if a subpath DECLARES a name its module does not export —
// the direction that breaks a consumer, because the import type-checks and then
// resolves to undefined at runtime.
//
// The opposite direction is deliberately allowed. Two components re-export a
// shared internal through their own public index purely to satisfy the
// `components-public-api` dependency-cruiser rule (ui-card-list's card styles,
// consumed by ui-card-item; ui-typography's theme, consumed by ui-card-list),
// so those names ride along in the emitted module without being part of the
// published API. Typing them would put internals into the contract that Story
// 5.3 exists to keep closed — the rollup does not carry them, so the `.d.mts`
// could not even name them. Leaving them untyped is what makes them
// unreachable from TypeScript, which is the intent.
function assertDeclarationsAreBacked(directory, declared, metafile) {
  const runtime = runtimeExportsOf(directory, metafile);
  const missing = declared.filter(name => !runtime.includes(name));
  if (missing.length > 0) {
    throw new Error(
      `build/${directory}.d.mts declares ${missing.join(', ')}, which build/${directory}.mjs ` +
        'does not export. The subpath would type-check and then resolve to undefined.'
    );
  }
}

// One `.d.mts` per subpath, re-exporting from the single API Extractor rollup.
// Types are erased, so a subpath importer pays nothing for the shared rollup —
// which keeps ONE self-contained declaration artifact (and the
// `ae-forgotten-export` gate that guards it) instead of running API Extractor
// once per entry.
function generateSubpathDeclarations(entryPoints, metafile) {
  const barrel = readFileSync(entryPoint, 'utf8');
  for (const directory of Object.keys(entryPoints)) {
    if (directory === 'index' || directory === LOCALES) continue;
    const { defaultExport, values, types } = barrelNamesFor(barrel, directory);
    const lines = [
      `// Generated by build.config.mjs — the '${directory}' subpath, typed from the rollup.`,
    ];
    if (defaultExport) lines.push(`export { ${defaultExport} as default } from './index.mjs';`);
    if (values.length) lines.push(`export { ${values.join(', ')} } from './index.mjs';`);
    if (types.length) lines.push(`export type { ${types.join(', ')} } from './index.mjs';`);
    assertDeclarationsAreBacked(
      directory,
      [...(defaultExport ? ['default'] : []), ...values],
      metafile
    );
    writeFileSync(path.resolve(currentDir, 'build', `${directory}.d.mts`), `${lines.join('\n')}\n`);
  }
}

if (!existsSync(entryPoint)) {
  process.stdout.write(
    'Skipping build because this bootstrap PR does not include src/components/index.ts yet.\n'
  );
  process.exit(0);
}

async function generateTypeDeclarations() {
  // esbuild does not emit type declarations, so the library's published `.d.mts`
  // is produced in two steps: tsc emits per-file declarations (keeping the `@/*`
  // path aliases) under temp/dts, then API Extractor rolls them into a single
  // self-contained build/index.d.mts (resolving the aliases and inlining internals).
  //
  // tsc does not prune stale declarations for deleted/renamed sources, so a reused
  // temp/dts could feed API Extractor leftover files and make the rollup depend on
  // build history. Start from a clean intermediate directory for a deterministic result.
  const dtsOutDir = path.resolve(currentDir, 'temp', 'dts');
  rmSync(dtsOutDir, { recursive: true, force: true });

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
  if (result.apiReportChanged) {
    throw new Error(
      'The public API differs from config/api/ui-toolkit.api.md. The build has rewritten the ' +
        'report; review the diff and commit it with the change.'
    );
  }

  // Invariant: the rollup must be self-contained. Fail the build if any internal
  // `@/*` path-alias reference leaked through instead of being inlined — such a file
  // would not resolve for consumers of the published package. Covers every alias form
  // emitted into a `.d.mts`: `from "@/…"`, side-effect `import "@/…"`, and inline
  // dynamic-import types `import("@/…").Type`.
  const rollupPath = path.resolve(currentDir, 'build', 'index.d.mts');
  if (ALIAS_IMPORT.test(readFileSync(rollupPath, 'utf8'))) {
    throw new Error(
      'build/index.d.mts contains unresolved "@/..." path-alias imports; the API Extractor rollup did not inline them.'
    );
  }
}

function generateLocalesDeclarations(metafile) {
  const text = readFileSync(path.resolve(currentDir, 'temp', 'dts', LOCALES, 'index.d.ts'), 'utf8');
  if (ALIAS_IMPORT.test(text)) {
    throw new Error(
      `temp/dts/${LOCALES}/index.d.ts contains unresolved "@/..." path-alias imports.`
    );
  }
  const declared = [...text.matchAll(/^export declare (?:const|function) (\w+)/gm)].map(
    match => match[1]
  );
  for (const name of ['resources', 'initI18n']) {
    if (!declared.includes(name)) {
      throw new Error(`src/${LOCALES}/index.ts no longer declares ${name}.`);
    }
  }
  assertDeclarationsAreBacked(LOCALES, declared, metafile);
  const header = `// Generated by build.config.mjs — the '${LOCALES}' subpath, typed from its own tsc output.\n`;
  writeFileSync(path.resolve(currentDir, 'build', `${LOCALES}.d.mts`), `${header}${text}`);
  for (const extension of ['.mjs', '.d.mts']) {
    if (!existsSync(path.resolve(currentDir, 'build', `${LOCALES}${extension}`))) {
      throw new Error(
        `build/ emitted no ${LOCALES} subpath (build/${LOCALES}${extension} is missing).`
      );
    }
  }
}

function copyFontLicenses() {
  const fontsDir = path.resolve(currentDir, 'src', 'assets', 'fonts');
  for (const family of readdirSync(fontsDir, { withFileTypes: true })) {
    if (!family.isDirectory()) continue;
    const licence = path.resolve(fontsDir, family.name, 'OFL.txt');
    if (!existsSync(licence)) {
      throw new Error(`src/assets/fonts/${family.name} ships font faces without an OFL.txt.`);
    }
    copyFileSync(licence, path.resolve(currentDir, 'build', `${family.name}-OFL.txt`));
  }
}

async function assertPublishable() {
  const { publint } = await import('publint');
  const { formatMessage } = await import('publint/utils');
  const { messages, pkg } = await publint({ pkgDir: currentDir, strict: true });
  for (const message of messages) {
    process.stdout.write(`publint ${message.type}: ${formatMessage(message, pkg)}\n`);
  }
  const errors = messages.filter(message => message.type === 'error');
  if (errors.length > 0) {
    throw new Error(`publint found ${errors.length} packaging error(s) in package.json.`);
  }
}

// Start from an empty outdir. Entries are derived from the public barrel, so a
// component that is renamed or unexported simply stops being emitted — its old
// `build/<name>.mjs` and `.d.mts` would otherwise survive, and the `./*` subpath
// pattern would keep publishing a stale entry point that nothing builds.
rmSync(path.resolve(currentDir, 'build'), { recursive: true, force: true });

esbuild
  .build({
    absWorkingDir: currentDir,
    outdir: path.resolve(currentDir, 'build'),
    entryPoints: componentEntryPoints(),
    entryNames: '[name]',
    // Code shared by several entries is hoisted into `chunks/` instead of being
    // duplicated into each one. Requires `format: 'esm'`, which this build
    // already uses.
    splitting: true,
    chunkNames: 'chunks/[name]-[hash]',
    bundle: true,
    minify: true,
    // Read by generateSubpathDeclarations below: the authoritative list of what
    // each emitted entry exports, which minified output text cannot supply.
    metafile: true,
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    // Externalize only peer dependencies — the consumer provides them. Swiper is
    // deliberately not a peer, so it and its carousel CSS must stay bundled
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
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })
  .then(async result => {
    await generateTypeDeclarations();
    generateSubpathDeclarations(componentEntryPoints(), result.metafile);
    generateLocalesDeclarations(result.metafile);
    copyFontLicenses();
    writeThirdPartyNotices({
      metafile: result.metafile,
      buildDir: path.resolve(currentDir, 'build'),
      rootDir: currentDir,
    });
    assertBundleFootprint({
      metafile: result.metafile,
      budgetPath: path.resolve(currentDir, 'config', 'bundle-budget.json'),
      buildDir: path.resolve(currentDir, 'build'),
    });
    await assertPublishable();
  })
  .catch(error => {
    process.stderr.write(`Build failed: ${error.message ?? error}\n`);
    process.exit(1);
  });
