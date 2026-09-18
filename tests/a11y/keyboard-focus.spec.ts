import { test, expect, type Page } from '@playwright/test';

import { gotoStory } from '../e2e/utils';

import { expectTabReaches, expectTabReachesWithVisibleFocus } from './keyboard';

async function openStory(page: Page, id: string): Promise<void> {
  await gotoStory(page, id);
  await page
    .locator('#storybook-root > :visible, #root > :visible')
    .first()
    .waitFor({ state: 'visible' });
}

test.describe('keyboard operability and focus', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'the keyboard contract runs on chromium only'
  );

  test('Tab reaches the button and its focus is visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uibutton--contained');
    await expectTabReachesWithVisibleFocus(page, page.getByRole('button'));
  });

  test('Tab reaches the link and its focus is visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await expectTabReachesWithVisibleFocus(page, page.getByRole('link'));
  });

  test('Tab reaches the checkbox and Space toggles it', async ({ page }) => {
    await openStory(page, 'uicomponents-uicheckbox--checkbox');
    const checkbox = page.getByRole('checkbox');

    await expectTabReaches(page, checkbox);
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
  });

  test('Tab walks the form in order and Enter submits it', async ({ page }) => {
    await openStory(page, 'uicomponents-uiform--default');

    await expectTabReaches(page, page.getByRole('textbox', { name: 'Email' }));
    await expectTabReaches(page, page.getByRole('button', { name: 'Sign in' }));
    await page.keyboard.press('Enter');
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
