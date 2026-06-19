// Only consumed by Jest's transform pipeline. `esbuild-jest` runs a Babel pass
// (via `babel-jest`) for any file whose source contains `mock(`/`ock(`, and that
// pass would otherwise crash on type-only imports (e.g. `import React` used only
// as `React.ReactElement`) because it lacks TypeScript type-stripping. Scoping
// `@babel/preset-typescript` to TS files makes that pass strip type annotations
// so `@babel/plugin-transform-modules-commonjs` no longer chokes on them.
// Storybook (SWC) and the package build (esbuild) do not use Babel.
module.exports = {
  overrides: [
    {
      test: /\.tsx?$/,
      // esbuild-jest runs this Babel pass (via babel-jest) only for files whose
      // source contains `mock(`/`ock(`. preset-typescript strips type annotations
      // so `transform-modules-commonjs` no longer crashes on type-only imports;
      // preset-react (automatic runtime) transforms JSX here so esbuild's own
      // classic JSX pass (it ignores the `jsx: 'automatic'` option) does not later
      // emit `React.createElement` against the import binding Babel already
      // renamed — which otherwise throws "React is not defined" at runtime.
      presets: [
        ['@babel/preset-typescript', { allowDeclareFields: true, onlyRemoveTypeImports: true }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    },
  ],
};
