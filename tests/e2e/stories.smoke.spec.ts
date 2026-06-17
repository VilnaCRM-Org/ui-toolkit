import { test, expect } from '@playwright/test';

import stories from '../visual/stories.json';

// 100% story coverage: every Storybook story is rendered and asserted to mount
// without an uncaught error, across all configured browsers. The manifest
// (tests/visual/stories.json) is shared with the visual suite; the completeness
// test below fails if it ever drifts from the live Storybook index, so no story
// can escape e2e + visual coverage.

type StoryEntry = { id: string; title: string; name: string };
type IndexEntry = { type: string; id: string };

test.describe('Story smoke (every story renders)', () => {
  for (const story of stories as StoryEntry[]) {
    test(`${story.title} — ${story.name}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', error => pageErrors.push(error.message));

      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);

      const root = page.locator('#storybook-root, #root').first();
      await expect(root).toBeVisible();
      // "Mounted" = the story rendered at least one element (content-less
      // components like skeletons/images have no text, so assert child elements,
      // not text).
      const mountedChildren: number = await root.evaluate(node => node.childElementCount);
      expect(mountedChildren, `story ${story.id} mounted no elements`).toBeGreaterThan(0);
      expect(pageErrors, pageErrors.join('\n')).toHaveLength(0);
    });
  }
});

test('the story manifest covers every live Storybook story', async ({ request, baseURL }) => {
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

  expect(manifestIds).toEqual(liveStoryIds);
});
