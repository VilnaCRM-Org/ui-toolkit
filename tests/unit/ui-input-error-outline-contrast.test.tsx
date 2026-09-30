import { inputSlotStyles } from '../../src/components/ui-input/slot-styles';
import { createUiTheme } from '../../src/utils/ui-theme';

const ERROR_OUTLINE: string = '&.Mui-error .MuiOutlinedInput-notchedOutline';

function channel(hex: string, offset: number): number {
  const value: number = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrast(a: string, b: string): number {
  const la: number = luminance(a);
  const lb: number = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function errorBorderColour(): string {
  const rule: Record<string, unknown> = inputSlotStyles(createUiTheme()).inputRoot[
    ERROR_OUTLINE
  ] as Record<string, unknown>;
  return rule.borderColor as string;
}

describe('UiInput error outline contrast', () => {
  it('paints the error outline with the error ink', () => {
    expect(errorBorderColour()).toBe('#DC3939');
  });

  it('clears 3:1 against the white input background', () => {
    expect(contrast(errorBorderColour(), '#FFFFFF')).toBeGreaterThanOrEqual(3);
  });

  it('clears 3:1 against the grey surface', () => {
    expect(contrast(errorBorderColour(), '#F4F5F6')).toBeGreaterThanOrEqual(3);
  });

  it('measures the retired stroke below the floor', () => {
    expect(contrast('#DF7878', '#FFFFFF')).toBeLessThan(3);
    expect(contrast('#FFFFFF', '#DF7878')).toBeCloseTo(2.96, 2);
  });
});
