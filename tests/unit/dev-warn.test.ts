import { devWarn } from '../../src/utils/dev-warn';

// `useDevWarning` (the effect wrapper) is exercised end to end by the component
// suites that consume it (ui-image, ui-card-list); here we pin the shared
// primitive's own contract: log in development, stay silent in production.
describe('devWarn', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach((): void => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
  });

  afterEach((): void => {
    warnSpy.mockRestore();
  });

  it('logs the message via console.warn in development', () => {
    devWarn('example warning');

    expect(warnSpy).toHaveBeenCalledWith('example warning');
  });

  it('emits nothing in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      devWarn('example warning');
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
