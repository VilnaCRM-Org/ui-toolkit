import resources from '../../i18n/localization.json';

type TranslationTree = { [key: string]: string | TranslationTree };

interface LocaleResources {
  translation: TranslationTree;
}

const locales: Record<string, LocaleResources> = resources;
const localeEntries: [string, LocaleResources][] = Object.entries(locales);
const referenceLocale: string = 'en';
const reference: LocaleResources = resources.en;

function leafKeys(tree: TranslationTree, prefix: string = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]): string[] => {
    const path: string = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : leafKeys(value, path);
  });
}

function leafValues(tree: TranslationTree): string[] {
  return Object.values(tree).flatMap((value): string[] =>
    typeof value === 'string' ? [value] : leafValues(value)
  );
}

describe('i18n/localization.json', () => {
  it('ships the reference locale and at least one translation of it', () => {
    expect(Object.keys(locales)).toContain(referenceLocale);
    expect(localeEntries.length).toBeGreaterThan(1);
  });

  it.each(localeEntries)('%s nests every string under the translation namespace', (_, locale) => {
    expect(Object.keys(locale)).toEqual(['translation']);
  });

  it.each(localeEntries)('%s has no blank string', (_, locale) => {
    const blank: string[] = leafValues(locale.translation).filter(value => value.trim() === '');
    expect(blank).toEqual([]);
  });

  it.each(localeEntries.filter(([name]) => name !== referenceLocale))(
    '%s carries exactly the key set of the reference locale',
    (_, locale) => {
      const expected: string[] = leafKeys(reference.translation).sort();
      const actual: string[] = leafKeys(locale.translation).sort();
      expect(actual).toEqual(expected);
    }
  );
});
