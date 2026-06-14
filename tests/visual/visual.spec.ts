import { test, expect, type Page } from '@playwright/test';

import stories from './stories.json';

// Visual regression runs on a single engine (chromium): pixel baselines are
// environment-locked, and cross-browser behaviour is already covered by the
// e2e suite. The story manifest is generated from the Storybook index (see
// scripts / the README) and committed so the run is identical in Docker.

type StoryEntry = { id: string; title: string; name: string };

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
`;

async function openFrozenStory(page: Page, id: string): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  // Wait for Storybook to finish rendering the story root before snapshotting.
  await page.locator('#storybook-root, #root').first().waitFor({ state: 'visible' });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(() => document.fonts.ready);
}

test.describe('Visual regression (Storybook stories)', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  test.use({ viewport: { width: 1280, height: 720 } });

  for (const story of stories as StoryEntry[]) {
    test(`${story.title} — ${story.name}`, async ({ page }) => {
      await openFrozenStory(page, story.id);

      await expect(page).toHaveScreenshot(`${story.id}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });
  }
});
