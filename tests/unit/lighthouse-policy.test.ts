import fs from 'node:fs';
import path from 'node:path';

import {
  CATALOGUE_TITLES,
  METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT,
  PERFORMANCE_FLOORS,
  TITLES_WITHOUT_CONTENTFUL_PAINT,
  TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT,
  assertionMatrix,
  performanceAssertions,
  performanceFloor,
  selectAuditedStories,
  shardStories,
  storyUrl,
} from '../../scripts/ci/lighthouse-policy';

type StoryEntry = { id: string; title: string; name: string };
type IndexEntry = { type: 'story' | 'docs'; id: string; title: string; name: string };
type StorybookIndex = { entries: Record<string, IndexEntry> };
type Assertion = string | Array<string | { minScore: number }>;
type Assertions = Record<string, Assertion>;
type MatrixEntry = {
  matchingUrlPattern: string;
  aggregationMethod: string;
  assertions: Assertions;
};

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
const titleOf = (id: string): string => manifest.find(story => story.id === id)?.title ?? '';
const COMPONENT_TITLE: string = 'UiComponents/UiButton';
const ICON_ONLY_TITLE: string = 'UiComponents/UiStatusBadge';
const CATALOGUE_TITLE: string = 'Showcase/New Components (Figma parity)';
const AUDITS: Assertions = { 'button-name': 'error', 'color-contrast': 'warn' };

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

  it('rejects a skip-list entry whose title only has a docs page', () => {
    const index: StorybookIndex = indexOf([
      { type: 'docs', id: 'a-title--docs', title: 'A', name: 'Docs' },
      storyEntry('b-title--story', 'B', 'Story'),
    ]);

    expect(() => selectAuditedStories(index, ['A'])).toThrow('absent from the Storybook index: A');
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

describe('TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT', () => {
  it('names exactly the icon-only titles, every one live in the Storybook inventory', () => {
    expect([...TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT].sort()).toEqual([
      'UiComponents/UiActionIconBar',
      'UiComponents/UiChevronButton',
      'UiComponents/UiSocialIconButton',
      'UiComponents/UiStatusBadge',
    ]);
    expect(liveTitles).toEqual(expect.arrayContaining(TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT));
  });

  it('keeps every icon-only title in the audit', () => {
    const audited: Set<string> = new Set(
      selectAuditedStories(liveIndex, TITLES_WITHOUT_CONTENTFUL_PAINT).map(titleOf)
    );

    expect(TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT.every(title => audited.has(title))).toBe(true);
  });

  it('asserts the three paint metrics Lighthouse can still score without an LCP candidate', () => {
    expect(METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT).toEqual([
      'first-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
    ]);
  });
});

describe('CATALOGUE_TITLES', () => {
  it('names every showcase board in the Storybook inventory and nothing else', () => {
    const boards: string[] = liveTitles.filter(title => title.startsWith('Showcase/')).sort();

    expect(boards).toHaveLength(1);
    expect([...CATALOGUE_TITLES].sort()).toEqual(boards);
  });

  it('keeps the board in the audit', () => {
    const audited: Set<string> = new Set(
      selectAuditedStories(liveIndex, TITLES_WITHOUT_CONTENTFUL_PAINT).map(titleOf)
    );

    expect(CATALOGUE_TITLES.every(title => audited.has(title))).toBe(true);
  });
});

describe('performanceAssertions', () => {
  it('holds a component story to the performance score floor of its form factor', () => {
    expect(performanceAssertions(COMPONENT_TITLE, 'desktop')).toEqual({
      'categories:performance': ['error', { minScore: 0.9 }],
    });
    expect(performanceAssertions(COMPONENT_TITLE, 'mobile')).toEqual({
      'categories:performance': ['error', { minScore: 0.4 }],
    });
  });

  it.each([
    ['desktop', 0.9],
    ['mobile', 0.4],
  ])(
    'holds an icon-only story to the %s floor on each paint metric instead of the score',
    (formFactor, minScore) => {
      const assertions: Assertions = performanceAssertions(ICON_ONLY_TITLE, formFactor);

      expect(Object.keys(assertions).sort()).toEqual(
        [...METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT].sort()
      );
      expect(Object.values(assertions)).toEqual(
        METRICS_SCORED_WITHOUT_LARGEST_CONTENTFUL_PAINT.map(() => ['error', { minScore }])
      );
    }
  );

  it('only warns on the catalogue board, at the floor of its form factor', () => {
    expect(performanceAssertions(CATALOGUE_TITLE, 'desktop')).toEqual({
      'categories:performance': ['warn', { minScore: 0.9 }],
    });
    expect(performanceAssertions(CATALOGUE_TITLE, 'mobile')).toEqual({
      'categories:performance': ['warn', { minScore: 0.4 }],
    });
  });

  it('rejects an unknown form factor for every kind of title', () => {
    for (const title of [COMPONENT_TITLE, ICON_ONLY_TITLE, CATALOGUE_TITLE]) {
      expect(() => performanceAssertions(title, 'tablet')).toThrow(
        'LHCI_FORM_FACTOR must be one of'
      );
    }
  });
});

describe('assertionMatrix', () => {
  const storyIds: string[] = [
    'uicomponents-uibutton--contained',
    'uicomponents-uistatusbadge--status-badge',
    'showcase-new-components-figma-parity--figma-parity',
  ];
  const matrix: MatrixEntry[] = assertionMatrix({
    index: liveIndex,
    storyIds,
    formFactor: 'desktop',
    audits: AUDITS,
  });

  it('emits one median-aggregated entry per audited story, in story order', () => {
    expect(matrix.map(entry => entry.aggregationMethod)).toEqual(['median', 'median', 'median']);
    expect(matrix.map(entry => entry.matchingUrlPattern)).toEqual(
      storyIds.map(id => `[?&]id=${id}&`)
    );
  });

  it('matches a story iframe by its whole id and nothing else', () => {
    const patternOf = (position: number): RegExp =>
      new RegExp(matrix[position]?.matchingUrlPattern ?? '(?!)');
    const button: RegExp = patternOf(0);
    const badge: RegExp = patternOf(1);

    expect(button.test(storyUrl('uicomponents-uibutton--contained'))).toBe(true);
    expect(button.test(storyUrl('uicomponents-uibutton--contained-icon'))).toBe(false);
    expect(badge.test(storyUrl('uicomponents-uistatusbadge--status-badge'))).toBe(true);
    expect(badge.test(storyUrl('uicomponents-uistatusbadge--status-badge-static'))).toBe(false);
    expect(
      badge.test('/iframe.html?viewMode=story&id=uicomponents-uistatusbadge--status-badge&')
    ).toBe(true);
  });

  it('carries the shared audits into every entry next to the performance assertions', () => {
    const [button, badge, board] = matrix.map(entry => entry.assertions);

    expect(button).toEqual({ ...AUDITS, ...performanceAssertions(COMPONENT_TITLE, 'desktop') });
    expect(badge).toEqual({ ...AUDITS, ...performanceAssertions(ICON_ONLY_TITLE, 'desktop') });
    expect(board).toEqual({ ...AUDITS, ...performanceAssertions(CATALOGUE_TITLE, 'desktop') });
  });

  it('rejects every icon-only and catalogue title the index no longer has', () => {
    const index: StorybookIndex = indexOf([storyEntry('a-title--story', 'A', 'Story')]);
    const missing: string = [...TITLES_WITHOUT_LARGEST_CONTENTFUL_PAINT, ...CATALOGUE_TITLES].join(
      ', '
    );

    expect(() =>
      assertionMatrix({ index, storyIds: ['a-title--story'], formFactor: 'desktop', audits: {} })
    ).toThrow(`absent from the Storybook index: ${missing}`);
    expect(missing).toContain(CATALOGUE_TITLE);
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

  it('fails the mobile run below the tripwire floor measured under simulated 4G', () => {
    expect(performanceFloor('mobile')).toBe(PERFORMANCE_FLOORS.mobile);
    expect(PERFORMANCE_FLOORS.mobile).toEqual(['error', { minScore: 0.4 }]);
  });

  it.each([undefined, '', 'tablet'])('rejects the form factor %j', formFactor => {
    expect(() => performanceFloor(formFactor)).toThrow('LHCI_FORM_FACTOR must be one of');
  });
});
