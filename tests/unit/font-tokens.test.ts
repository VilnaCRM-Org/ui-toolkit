import { fontFamilies, fontFamilyCustomProperties } from '../../src/utils/font-tokens';

describe('font tokens', () => {
  it('names the two custom properties consumers can set', () => {
    expect(fontFamilyCustomProperties).toEqual({
      inter: '--ui-toolkit-font-inter',
      golos: '--ui-toolkit-font-golos',
    });
  });

  it('resolves each family through its custom property with the self-hosted fallback', () => {
    expect(fontFamilies).toEqual({
      inter: 'var(--ui-toolkit-font-inter, Inter)',
      golos: "var(--ui-toolkit-font-golos, 'Golos Text')",
    });
  });

  it.each([
    ['inter', 'Inter'],
    ['golos', "'Golos Text'"],
  ] as const)('composes the %s token from its property and fallback', (key, fallback) => {
    expect(fontFamilies[key]).toBe(`var(${fontFamilyCustomProperties[key]}, ${fallback})`);
  });
});
