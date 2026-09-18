import i18next from 'i18next';

import { initI18n, resources } from '../../src/locales';

type FooterCopy = { footer: { copyright: string; privacy: string } };

function translationOf(lng: string): FooterCopy {
  return (resources[lng] ?? {}).translation as FooterCopy;
}

describe('@vilnacrm/ui-toolkit/locales', () => {
  afterEach((): void => {
    initI18n();
  });

  it('ships the en and uk translation namespaces', () => {
    expect(Object.keys(resources).sort()).toEqual(['en', 'uk']);
    expect(Object.keys(resources.en ?? {})).toEqual(['translation']);
    expect(Object.keys(resources.uk ?? {})).toEqual(['translation']);
    expect(translationOf('en').footer.copyright).toBe('Copyright © ТОВ “Vilna CRM”');
  });

  it('initialises the default i18next instance with the documented defaults', () => {
    const instance: typeof i18next = initI18n();

    expect(instance).toBe(i18next);
    expect(instance.language).toBe('en');
    expect(instance.options.fallbackLng).toBe('en');
    expect(instance.options.interpolation?.escapeValue).toBe(false);
    expect(instance.t('footer.copyright')).toBe('Copyright © ТОВ “Vilna CRM”');
  });

  it('applies overrides and keeps English as the fallback', () => {
    const instance: typeof i18next = initI18n({ lng: 'uk' });

    expect(instance).toBe(i18next);
    expect(instance.language).toBe('uk');
    expect(instance.t('footer.privacy')).toBe(translationOf('uk').footer.privacy);
    expect(instance.t('footer.privacy', { lng: 'de' })).toBe(translationOf('en').footer.privacy);
  });
});
