import { expect, type APIRequestContext, type Page } from '@playwright/test';

export type StoryEntry = { id: string; title: string; name: string };
type IndexEntry = { type: string; id: string };

// Navigate to an isolated Storybook story iframe (no manager chrome), which is
// what the e2e/visual suites assert against.
export async function gotoStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
}

export async function expectManifestMatchesIndex(
  request: APIRequestContext,
  baseURL: string | undefined,
  manifest: readonly StoryEntry[]
): Promise<void> {
  const response = await request.get(`${baseURL}/index.json`);
  expect(response.ok()).toBeTruthy();

  const index: { entries: Record<string, IndexEntry> } = await response.json();
  const liveStoryIds: string[] = Object.values(index.entries)
    .filter(entry => entry.type === 'story')
    .map(entry => entry.id)
    .sort((a, b) => a.localeCompare(b));
  const manifestIds: string[] = manifest.map(entry => entry.id).sort((a, b) => a.localeCompare(b));

  expect(manifestIds).toEqual(liveStoryIds);
}
