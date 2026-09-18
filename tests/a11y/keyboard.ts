import { expect, type Locator, type Page } from '@playwright/test';

export async function expectTabReaches(page: Page, target: Locator): Promise<void> {
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
}

export async function expectFocusVisible(target: Locator): Promise<void> {
  const focusVisible: boolean = await target.evaluate(element => element.matches(':focus-visible'));
  expect(focusVisible).toBe(true);
}
