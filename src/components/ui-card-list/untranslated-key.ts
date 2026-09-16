import type { UiCardItemData } from './types';

const KEY_SHAPE: RegExp = /^\S+\.\S+$/;

function looksLikeKey(value: unknown): value is string {
  return typeof value === 'string' && KEY_SHAPE.test(value);
}

export function untranslatedKeyWarning(
  item: UiCardItemData,
  exists: (key: string) => boolean
): string | null {
  const missing: string | undefined = [item.title, item.text, item.alt].find(
    (value): value is string => looksLikeKey(value) && !exists(value)
  );
  if (missing === undefined) {
    return null;
  }
  return (
    `UiCardList card "${item.id}" received "${missing}", which looks like an i18n key ` +
    'with no translation; it renders verbatim. Add the key to the i18next resources or ' +
    'pass the translated string.'
  );
}
