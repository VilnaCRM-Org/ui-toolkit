import UiColorTheme from '../../src/components/UiColorTheme';

describe('UiColorTheme', () => {
  it('defines the shared palette tokens', () => {
    expect(UiColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(UiColorTheme.palette.secondary.main).toBe('#FFC01E');
    expect(UiColorTheme.palette.error.main).toBe('#DC3939');
    expect(UiColorTheme.palette.textLinkHover.main).toBe('#297FFF');
    expect(UiColorTheme.palette.textLinkActive.main).toBe('#0399ED');
    expect(UiColorTheme.palette.backgroundGrey300.main).toBe('#F5F6F7');
  });
});
