test('discovers plain .test.ts files under src/test', () => {
  expect(__filename).toMatch(/src\/test\/config\/jestDiscovery\.test\.ts$/);
});
