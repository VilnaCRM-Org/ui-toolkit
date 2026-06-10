test('discovers plain .test.ts files under tests/unit', () => {
  expect(__filename).toMatch(/tests\/unit\/config\/jestDiscovery\.test\.ts$/);
});
