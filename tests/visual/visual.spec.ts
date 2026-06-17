import { test, expect, type Page } from '@playwright/test';

import stories from './stories.json';

// Visual regression runs on a single engine (chromium): pixel baselines are
// environment-locked, and cross-browser behaviour is already covered by the
// e2e suite. The story manifest is generated from the Storybook index (see
// scripts / the README) and committed so the run is identical in Docker.

type StoryEntry = { id: string; title: string; name: string };
type IndexEntry = { type: string; id: string };

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

test('the manifest has a baseline target for every live Storybook story', async ({
  request,
  baseURL,
}) => {
  const response = await request.get(`${baseURL}/index.json`);
  expect(response.ok()).toBeTruthy();

  const index: { entries: Record<string, IndexEntry> } = await response.json();
  const liveStoryIds: string[] = Object.values(index.entries)
    .filter(entry => entry.type === 'story')
    .map(entry => entry.id)
    .sort((a, b) => a.localeCompare(b));
  const manifestIds: string[] = (stories as StoryEntry[])
    .map(entry => entry.id)
    .sort((a, b) => a.localeCompare(b));

  // Every story must be in the manifest the screenshot loop iterates — so no
  // story can ship without a visual baseline (100% story coverage).
  expect(manifestIds).toEqual(liveStoryIds);
});
