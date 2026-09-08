import { hasText } from '../../src/components/field-controls/has-text';

// `hasText` decides two different things across the kit: whether a field shows
// its visible label (and so whether the accessible name falls back to
// `aria-label`), and whether a dev warning fires for blank content. The second
// job is why the guard is not just a null check — those warnings exist for
// runtime data that violates the prop types, so the guard has to survive one.
describe('hasText', () => {
  it('accepts a real, non-blank string', () => {
    expect(hasText('Додати стовпець')).toBe(true);
    expect(hasText(' x ')).toBe(true);
  });

  it('rejects nullish and blank strings', () => {
    expect(hasText(undefined)).toBe(false);
    expect(hasText(null)).toBe(false);
    expect(hasText('')).toBe(false);
    expect(hasText('   ')).toBe(false);
    expect(hasText('\t\n')).toBe(false);
  });

  it('rejects a non-string instead of throwing on it', () => {
    // The prop types forbid these, but CMS and API payloads produce them, and
    // a bare `.trim()` would raise a TypeError from inside a dev-warning path
    // whose entire purpose is to report the misconfiguration.
    expect(() => hasText(42)).not.toThrow();
    expect(hasText(42)).toBe(false);
    expect(hasText({})).toBe(false);
    expect(hasText([])).toBe(false);
    expect(hasText(true)).toBe(false);
    expect(hasText(new String('boxed'))).toBe(false);
  });
});
