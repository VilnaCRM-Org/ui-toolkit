import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import {
  expectManifestMatchesIndex,
  gotoStory,
  waitForStoryRender,
  type StoryEntry,
} from '../e2e/utils';
import stories from '../visual/stories.json';

import { DISABLED_RULES, WCAG_AA_TAGS, withoutAllowedViolations } from './axe-config';

test.describe('axe scan (every Storybook story iframe)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'the axe scan runs on chromium only');

  for (const story of stories as StoryEntry[]) {
    test(`${story.title} — ${story.name}`, async ({ page }) => {
      await gotoStory(page, story.id);
      await page
        .locator('#storybook-root > :visible, #root > :visible')
        .first()
        .waitFor({ state: 'visible' });
      expect(await waitForStoryRender(page, story.id)).toBe('finished');

      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_AA_TAGS])
        .disableRules([...DISABLED_RULES])
        .analyze();

      expect(withoutAllowedViolations(results.violations)).toEqual([]);
    });
  }
});

test('the story manifest the axe scan iterates covers every live Storybook story', async ({
  request,
  baseURL,
}) => {
  await expectManifestMatchesIndex(request, baseURL, stories as StoryEntry[]);
});
