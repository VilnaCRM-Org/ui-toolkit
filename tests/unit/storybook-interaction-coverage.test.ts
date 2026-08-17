import fs from 'node:fs';
import path from 'node:path';

import {
  scanMetaTitle,
  scanStories,
  type ScannedStory,
} from '../../scripts/ci/story-play-functions';
import {
  INTERACTION_TAG,
  MINIMUM_COMPONENTS,
  formatDrift,
  junitPlayTestKeys,
  liveInteractionStories,
  type InteractionStory,
} from '../../scripts/ci/storybook-interaction-manifest';

// Drift guard for the Storybook interaction (play function) suite — the
// "fail-if-absent from day one" half of issue #100. `make test-storybook` proves
// the registered play functions PASS in a real browser; this suite proves the
// registry itself cannot silently shrink or fall out of sync with the sources.

const projectRoot: string = path.resolve(__dirname, '../..');
const manifestPath: string = path.join(projectRoot, 'tests/storybook/interaction-stories.json');
const storiesManifestPath: string = path.join(projectRoot, 'tests/visual/stories.json');

type StoryEntry = { id: string; title: string; name: string };

const manifest: InteractionStory[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const allStories: StoryEntry[] = JSON.parse(fs.readFileSync(storiesManifestPath, 'utf8'));

function storyFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full: string = path.join(directory, entry.name);
    if (entry.isDirectory()) return storyFiles(full);
    return entry.name.endsWith('.stories.tsx') ? [full] : [];
  });
}

type SourceStory = ScannedStory & { title: string };

function sourceStories(): SourceStory[] {
  return storyFiles(path.join(projectRoot, 'src')).flatMap(file => {
    const source: string = fs.readFileSync(file, 'utf8');
    const title: string | null = scanMetaTitle(file, source);
    if (title === null) return [];
    return scanStories(file, source).map(story => ({ ...story, title }));
  });
}

const sources: string[] = storyFiles(path.join(projectRoot, 'src'));
const scanned: SourceStory[] = sourceStories();
const key = (story: { title: string; exportName: string }): string =>
  `${story.title} ${story.exportName}`;

describe('Storybook interaction manifest', () => {
  it('reads a meta title out of every story file', () => {
    // `sourceStories` drops files whose title it cannot read; without this,
    // an unparsable story file would silently hide its play functions.
    const untitled: string[] = sources.filter(
      file => scanMetaTitle(file, fs.readFileSync(file, 'utf8')) === null
    );

    expect(sources.length).toBeGreaterThan(0);
    expect(untitled).toEqual([]);
  });

  it('is not empty and covers at least the required number of components', () => {
    expect(manifest.length).toBeGreaterThan(0);
    expect(new Set(manifest.map(story => story.title)).size).toBeGreaterThanOrEqual(
      MINIMUM_COMPONENTS
    );
  });

  it('registers exactly the stories that declare a play function', () => {
    const declared: string[] = scanned.filter(story => story.hasPlay).map(key);

    expect(formatDrift(manifest.map(key), declared)).toBeNull();
  });

  it('requires every registered story to carry the interaction tag', () => {
    const registered: Set<string> = new Set(manifest.map(key));
    const untagged: string[] = scanned
      .filter(story => registered.has(key(story)) && !story.tags.includes(INTERACTION_TAG))
      .map(key);

    expect(untagged).toEqual([]);
  });

  it('only registers stories that the shared story manifest knows about', () => {
    const live: Set<string> = new Set(allStories.map(story => `${story.id}|${story.title}`));
    const unknown: string[] = manifest
      .filter(story => !live.has(`${story.id}|${story.title}`))
      .map(story => story.id);

    expect(unknown).toEqual([]);
  });
});

describe('interaction gate helpers', () => {
  it('reads interaction-tagged stories out of a live Storybook index', () => {
    const index = {
      entries: {
        a: { type: 'docs', id: 'a', title: 'T', name: 'Docs', tags: ['interaction'] },
        b: {
          type: 'story',
          id: 'b',
          title: 'T',
          name: 'Plain',
          exportName: 'Plain',
          tags: ['dev'],
        },
        c: {
          type: 'story',
          id: 'c',
          title: 'T',
          name: 'Play',
          exportName: 'Play',
          tags: ['interaction'],
        },
        d: { type: 'story', id: 'd' },
      },
    };

    expect(liveInteractionStories(index)).toEqual([
      { id: 'c', title: 'T', name: 'Play', exportName: 'Play' },
    ]);
    expect(liveInteractionStories(null)).toEqual([]);
  });

  it('counts only passing play tests in a JUnit report', () => {
    const report: string = [
      // jest-junit writes a passing case either self-closing or with an empty body.
      '<testcase classname="T A play-test" name="T A play-test" time="1"/>',
      '<testcase classname="T D play-test" name="T D play-test" time="0.26">\n</testcase>',
      '<testcase classname="T B play-test" name="T B play-test"><skipped/></testcase>',
      '<testcase classname="T C play-test" name="T C play-test"><failure>boom</failure></testcase>',
      '<testcase classname="T E play-test" name="T E play-test"><error>died</error></testcase>',
      '<testcase classname="T no-op" name="T no-op" time="0"/>',
    ].join('\n');

    expect(junitPlayTestKeys(report)).toEqual(['T A', 'T D']);
  });

  it('reports both missing and unregistered keys', () => {
    expect(formatDrift(['a', 'b'], ['b', 'c'])).toBe('  - missing: a\n  - unregistered: c');
    expect(formatDrift(['a'], ['a'])).toBeNull();
  });
});
