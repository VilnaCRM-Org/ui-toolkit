/**
 * Shared lifecycle for the console-silencing helpers: registers
 * `beforeEach`/`afterEach` hooks that replace the given console method with a
 * silent spy for the enclosing suite and returns a live handle to the active
 * spy for suites that need to assert on it. `mock-console-warn.ts` and
 * `mock-console-error.ts` are thin named wrappers so call sites stay explicit
 * about which channel they silence.
 */
export default function mockConsoleMethod(method: 'warn' | 'error'): {
  readonly spy: jest.SpyInstance;
} {
  const handle: { spy: jest.SpyInstance } = {
    spy: undefined as unknown as jest.SpyInstance,
  };

  beforeEach((): void => {
    handle.spy = jest.spyOn(console, method).mockImplementation((): void => undefined);
  });

  afterEach((): void => {
    handle.spy.mockRestore();
  });

  return handle;
}
