import UiColorTheme, {
  crmColorTheme,
  sharedPalette,
  websiteColorTheme,
} from '../../src/components/ui-color-theme';

describe('UiColorTheme', () => {
  it('defines the shared palette tokens', () => {
    expect(UiColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(UiColorTheme.palette.secondary.main).toBe('#FFC01E');
    expect(UiColorTheme.palette.error.main).toBe('#DC3939');
    expect(UiColorTheme.palette.textLinkHover.main).toBe('#297FFF');
    expect(UiColorTheme.palette.textLinkActive.main).toBe('#0399ED');
    expect(UiColorTheme.palette.backgroundGrey300.main).toBe('#F5F6F7');
    expect(UiColorTheme.palette.strokeDanger.main).toBe('#DF7878');
  });

  it('exports explicit website and CRM color presets', () => {
    expect(websiteColorTheme.palette.primary.main).toBe(sharedPalette.primary.main);
    expect(crmColorTheme.palette.secondary.main).toBe(sharedPalette.secondary.main);
    expect(crmColorTheme.palette.textLinkHover.main).toBe(sharedPalette.textLinkHover.main);
    expect(websiteColorTheme.palette.strokeDanger.main).toBe(sharedPalette.strokeDanger.main);
    expect(crmColorTheme.palette.strokeDanger.main).toBe(sharedPalette.strokeDanger.main);
  });
});
