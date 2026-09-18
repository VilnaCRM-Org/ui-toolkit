import { test, expect } from '@playwright/test';

import stories from '../visual/stories.json';

import { expectManifestMatchesIndex, type StoryEntry } from './utils';

// 100% story coverage: every Storybook story is rendered and asserted to mount
// without an uncaught error, across all configured browsers. The manifest
// (tests/visual/stories.json) is shared with the visual suite; the completeness
// test below fails if it ever drifts from the live Storybook index, so no story
// can escape e2e + visual coverage.

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
  await expectManifestMatchesIndex(request, baseURL, stories as StoryEntry[]);
});
