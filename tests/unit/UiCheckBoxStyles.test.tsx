/**
 * Covers the `typeof Check === 'string'` branch in
 * src/components/ui-checkbox/styles.ts line 8.
 *
 * The global SVG mock (tests/unit/mocks/svgMock.ts) resolves the imported
 * asset to an object `{ src }`, so the default test run only exercises the
 * `Check.src` (else) side of the ternary. Here we override the asset module so
 * the import resolves to a plain string, forcing the `true` side, and assert
 * the resulting checked-box background image embeds that string URL.
 */

interface CheckedBoxRule {
  backgroundImage?: string;
}

interface CheckboxStyles {
  checkbox: { '& .ui-checkbox-box.ui-checkbox-box--checked': CheckedBoxRule };
}

function loadCheckedBoxRule(): CheckedBoxRule {
  const styles: CheckboxStyles = require('@/components/ui-checkbox/styles').default;
  return styles.checkbox['& .ui-checkbox-box.ui-checkbox-box--checked'];
}

describe('UiCheckbox styles checkIconUrl resolution', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('uses the string asset directly when the SVG import resolves to a string', () => {
    jest.isolateModules(() => {
      jest.doMock('@/assets/svg/check.svg', () => 'string-check.svg', { virtual: true });

      const checkedBox: CheckedBoxRule = loadCheckedBoxRule();

      expect(checkedBox.backgroundImage).toBe('url(string-check.svg)');
    });
  });

  it('uses the object .src field when the SVG import resolves to an object', () => {
    jest.isolateModules(() => {
      jest.doMock('@/assets/svg/check.svg', () => ({ src: 'object-check.svg' }), {
        virtual: true,
      });

      const checkedBox: CheckedBoxRule = loadCheckedBoxRule();

      expect(checkedBox.backgroundImage).toBe('url(object-check.svg)');
    });
  });
});
