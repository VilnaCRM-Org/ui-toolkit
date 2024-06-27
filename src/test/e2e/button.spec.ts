import { test, expect, Locator, Page } from '@playwright/test';

import {
  containedButtonText,
  outlinedButtonText,
  socialButtonText,
  storybookUrl,
} from './constants';

async function checkButtonVisibility(
  page: Page,
  storyPath: string,
  buttonText: string
): Promise<void> {
  await page.goto(`${storybookUrl}/?path=/story/${storyPath}`);
  const button: Locator = page.getByText(buttonText);
  await expect(button).toBeVisible();
}

test.describe('Buttons tests', () => {
  test('Check if the contained button is rendered', async ({ page }) => {
    await checkButtonVisibility(page, 'uicomponents-uibutton--contained', containedButtonText);
  });

  test('Check if the outlined button is rendered', async ({ page }) => {
    await checkButtonVisibility(page, 'uicomponents-uibutton--outlined', outlinedButtonText);
  });

  test('Check if the social button is rendered', async ({ page }) => {
    await checkButtonVisibility(page, 'uicomponents-uibutton--social-button', socialButtonText);
  });
});
