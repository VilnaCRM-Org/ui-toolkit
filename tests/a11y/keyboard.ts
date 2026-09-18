import { expect, type Locator, type Page } from '@playwright/test';

type FocusPaint = {
  outline: string;
  boxShadow: string;
  borderColor: string;
  backgroundColor: string;
};

const FOCUS_RIPPLE: string = '.MuiTouchRipple-ripplePulsate';

async function paintOf(target: Locator): Promise<FocusPaint> {
  return target.evaluate((element: Element): FocusPaint => {
    const style: CSSStyleDeclaration = getComputedStyle(element);
    const drawsOutline: boolean = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    return {
      outline: drawsOutline ? `${style.outlineStyle} ${style.outlineWidth}` : 'none',
      boxShadow: style.boxShadow,
      borderColor: style.borderColor,
      backgroundColor: style.backgroundColor,
    };
  });
}

async function focusIndicators(target: Locator, rest: FocusPaint): Promise<string[]> {
  const focused: FocusPaint = await paintOf(target);
  const ripple: number = await target.locator(FOCUS_RIPPLE).count();
  const indicators: string[] = [];
  if (focused.outline !== 'none') indicators.push(`outline ${focused.outline}`);
  if (ripple > 0) indicators.push('focus ripple');
  if (focused.boxShadow !== rest.boxShadow) indicators.push('box-shadow');
  if (focused.borderColor !== rest.borderColor) indicators.push('border-color');
  if (focused.backgroundColor !== rest.backgroundColor) indicators.push('background-color');
  return indicators;
}

export async function expectTabReaches(page: Page, target: Locator): Promise<void> {
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
}

export async function expectTabReachesWithVisibleFocus(page: Page, target: Locator): Promise<void> {
  const rest: FocusPaint = await paintOf(target);
  await expectTabReaches(page, target);
  const focusVisible: boolean = await target.evaluate((element: Element): boolean =>
    element.matches(':focus-visible')
  );
  expect(focusVisible).toBe(true);
  await expect.poll((): Promise<string[]> => focusIndicators(target, rest)).not.toEqual([]);
}
