import { Page } from '@playwright/test';

// Navigate to an isolated Storybook story iframe (no manager chrome), which is
// what the e2e/visual suites assert against.
export async function gotoStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
}
