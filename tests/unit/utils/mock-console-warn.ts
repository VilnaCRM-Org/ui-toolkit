/**
 * Registers `beforeEach`/`afterEach` hooks that silence `console.warn` for the
 * enclosing suite — several controls emit dev-only accessibility guidance we do
 * not want cluttering test output — and returns a live handle to the active spy
 * for suites that need to assert on it.
 *
 * Usage:
 *   const warn = mockConsoleWarn();
 *   // ...later, inside a test:
 *   expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('...'));
 */
export default function mockConsoleWarn(): { readonly spy: jest.SpyInstance } {
  const handle: { spy: jest.SpyInstance } = {
    spy: undefined as unknown as jest.SpyInstance,
  };

  beforeEach((): void => {
    handle.spy = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
  });

  afterEach((): void => {
    handle.spy.mockRestore();
  });

  return handle;
}
