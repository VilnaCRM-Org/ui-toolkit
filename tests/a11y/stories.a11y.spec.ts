import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { expectManifestMatchesIndex, gotoStory, type StoryEntry } from '../e2e/utils';
import interactionStories from '../storybook/interaction-stories.json';
import stories from '../visual/stories.json';

import { DISABLED_RULES, WCAG_AA_TAGS, withoutAllowedViolations } from './axe-config';

const interactionIds: Set<string> = new Set(
  (interactionStories as StoryEntry[]).map(entry => entry.id)
);
const scannedStories: StoryEntry[] = (stories as StoryEntry[]).filter(
  story => !interactionIds.has(story.id)
);

test.describe('axe scan (every Storybook story iframe)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'the axe scan runs on chromium only');

  for (const story of scannedStories) {
    test(`${story.title} — ${story.name}`, async ({ page }) => {
      await gotoStory(page, story.id);
      await page
        .locator('#storybook-root > :visible, #root > :visible')
        .first()
        .waitFor({ state: 'visible' });

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

test('every story the axe scan skips is a registered interaction story', () => {
  const exempt: string[] = (stories as StoryEntry[])
    .map(story => story.id)
    .filter(id => interactionIds.has(id))
    .sort((a, b) => a.localeCompare(b));
  const registered: string[] = [...interactionIds].sort((a, b) => a.localeCompare(b));

  expect(exempt).toEqual(registered);
});
