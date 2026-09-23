import type { Theme } from '@mui/material';

export type OptionsRecord = Record<string, unknown>;

export function isPlainObject(value: unknown): value is OptionsRecord {
  return (
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

export function mergeOptions(base: OptionsRecord, override: OptionsRecord): OptionsRecord {
  const merged: OptionsRecord = { ...base };
  Object.entries(override)
    .filter(([, value]) => value !== undefined)
    .forEach(([key, value]) => {
      const current: unknown = merged[key];
      merged[key] =
        isPlainObject(current) && isPlainObject(value) ? mergeOptions(current, value) : value;
    });
  return merged;
}

export function cacheByTheme<T>(build: (theme: Theme) => T): (theme: Theme) => T {
  const cache: WeakMap<Theme, T> = new WeakMap<Theme, T>();
  return (theme: Theme): T => {
    const cached: T | undefined = cache.get(theme);
    if (cached !== undefined) {
      return cached;
    }
    const built: T = build(theme);
    cache.set(theme, built);
    return built;
  };
}
