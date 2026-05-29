const { findAvailablePort } = require('../../resolveStorybookHostPort');

describe('findAvailablePort', () => {
  test('returns the first available port at or above the requested port', async () => {
    const isPortAvailable = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(findAvailablePort(6006, isPortAvailable)).resolves.toBe(6008);
    expect(isPortAvailable.mock.calls).toEqual([[6006], [6007], [6008]]);
  });

  test('returns the requested port when it is already available', async () => {
    const isPortAvailable = jest.fn().mockResolvedValue(true);

    await expect(findAvailablePort(6010, isPortAvailable)).resolves.toBe(6010);
    expect(isPortAvailable).toHaveBeenCalledWith(6010);
  });

  test('supports synchronous port checker functions', async () => {
    const isPortAvailable = jest.fn(port => port >= 6008);

    await expect(findAvailablePort(6006, isPortAvailable)).resolves.toBe(6008);
    expect(isPortAvailable.mock.calls).toEqual([[6006], [6007], [6008]]);
  });
});
