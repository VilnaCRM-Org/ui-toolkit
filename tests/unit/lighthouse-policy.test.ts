import fs from 'node:fs';
import path from 'node:path';

import {
  PERFORMANCE_FLOORS,
  TITLES_WITHOUT_CONTENTFUL_PAINT,
  performanceFloor,
  selectAuditedStories,
  shardStories,
  storyUrl,
} from '../../scripts/ci/lighthouse-policy';

type StoryEntry = { id: string; title: string; name: string };
type IndexEntry = { type: 'story' | 'docs'; id: string; title: string; name: string };
type StorybookIndex = { entries: Record<string, IndexEntry> };

const storiesManifestPath: string = path.resolve(__dirname, '../visual/stories.json');
const manifest: StoryEntry[] = JSON.parse(fs.readFileSync(storiesManifestPath, 'utf8'));

function indexOf(entries: IndexEntry[]): StorybookIndex {
  return { entries: Object.fromEntries(entries.map(entry => [entry.id, entry])) };
}

function storyEntry(id: string, title: string, name: string): IndexEntry {
  return { type: 'story', id, title, name };
}

const liveIndex: StorybookIndex = indexOf([
  { type: 'docs', id: 'uicomponents-uibutton--docs', title: 'UiComponents/UiButton', name: 'Docs' },
  ...manifest.map(story => storyEntry(story.id, story.title, story.name)),
]);
const liveTitles: string[] = [...new Set(manifest.map(story => story.title))];

describe('selectAuditedStories', () => {
  it('audits exactly one story for every title in the Storybook index', () => {
    const audited: string[] = selectAuditedStories(liveIndex, []);
    const auditedTitles: string[] = audited.map(
      id => manifest.find(story => story.id === id)?.title ?? ''
    );

    expect(audited).toHaveLength(liveTitles.length);
    expect([...auditedTitles].sort()).toEqual([...liveTitles].sort());
  });

  it('covers the card list, whose swiper the sample used to omit', () => {
    expect(selectAuditedStories(liveIndex, [])).toContain(
      'uicomponents-uicardlist--card-list-large'
    );
  });

  it('takes the first story declared for a title and returns ids in code-unit order', () => {
    const index: StorybookIndex = indexOf([
      storyEntry('z-title--second', 'Z', 'Second'),
      storyEntry('z-title--first', 'Z', 'First'),
      storyEntry('a-title--only', 'A', 'Only'),
    ]);

    expect(selectAuditedStories(index, [])).toEqual(['a-title--only', 'z-title--second']);
  });

  it('never audits a docs entry', () => {
    const index: StorybookIndex = indexOf([
      { type: 'docs', id: 'a-title--docs', title: 'A', name: 'Docs' },
      storyEntry('a-title--story', 'A', 'Story'),
    ]);

    expect(selectAuditedStories(index, [])).toEqual(['a-title--story']);
  });

  it('drops a skipped title', () => {
    const index: StorybookIndex = indexOf([
      storyEntry('a-title--story', 'A', 'Story'),
      storyEntry('b-title--story', 'B', 'Story'),
    ]);

    expect(selectAuditedStories(index, ['B'])).toEqual(['a-title--story']);
  });

  it('rejects a skip-list entry the index no longer has', () => {
    expect(() => selectAuditedStories(liveIndex, ['UiComponents/Removed'])).toThrow(
      'absent from the Storybook index: UiComponents/Removed'
    );
  });

  it('rejects an index without a single story', () => {
    const index: StorybookIndex = indexOf([
      { type: 'docs', id: 'a-title--docs', title: 'A', name: 'Docs' },
    ]);

    expect(() => selectAuditedStories(index, [])).toThrow('no story to audit');
  });
});

describe('TITLES_WITHOUT_CONTENTFUL_PAINT', () => {
  it('names every skeleton title in the Storybook inventory and nothing else', () => {
    const skeletonTitles: string[] = liveTitles.filter(title => title.includes('Skeleton')).sort();

    expect([...TITLES_WITHOUT_CONTENTFUL_PAINT].sort()).toEqual(skeletonTitles);
  });

  it('leaves every other title audited', () => {
    const audited: string[] = selectAuditedStories(liveIndex, TITLES_WITHOUT_CONTENTFUL_PAINT);
    const auditedTitles: Set<string> = new Set(
      audited.map(id => manifest.find(story => story.id === id)?.title ?? '')
    );

    expect(audited).toHaveLength(liveTitles.length - TITLES_WITHOUT_CONTENTFUL_PAINT.length);
    expect(TITLES_WITHOUT_CONTENTFUL_PAINT.some(title => auditedTitles.has(title))).toBe(false);
  });
});

describe('shardStories', () => {
  const ids: string[] = ['a', 'b', 'c', 'd', 'e'];

  it('partitions the audited stories across the shards without overlap or loss', () => {
    const shards: string[][] = ['1/3', '2/3', '3/3'].map(spec => shardStories(ids, spec));

    expect(shards).toEqual([['a', 'd'], ['b', 'e'], ['c']]);
    expect(shards.flat().sort()).toEqual(ids);
  });

  it('is the identity for a single shard', () => {
    expect(shardStories(ids, '1/1')).toEqual(ids);
  });

  it.each(['', '0/2', '2', '1/0', 'a/b', '1/2/3'])('rejects the malformed spec %j', spec => {
    expect(() => shardStories(ids, spec)).toThrow('LHCI_SHARD must look like');
  });

  it('rejects an index beyond the shard count', () => {
    expect(() => shardStories(ids, '3/2')).toThrow('index 3 exceeds its shard count 2');
  });

  it('refuses a shard that would audit nothing', () => {
    expect(() => shardStories(['a'], '2/2')).toThrow('selects no story out of 1');
  });
});

describe('storyUrl', () => {
  it('addresses the isolated story iframe', () => {
    expect(storyUrl('a-title--story')).toBe('/iframe.html?id=a-title--story&viewMode=story');
  });
});

describe('performanceFloor', () => {
  it('fails the desktop run below the calibrated performance floor', () => {
    expect(performanceFloor('desktop')).toEqual(['error', { minScore: 0.9 }]);
  });

  it('returns the mobile policy', () => {
    expect(performanceFloor('mobile')).toBe(PERFORMANCE_FLOORS.mobile);
  });

  it.each([undefined, '', 'tablet'])('rejects the form factor %j', formFactor => {
    expect(() => performanceFloor(formFactor)).toThrow('LHCI_FORM_FACTOR must be one of');
  });
});
