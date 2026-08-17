import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  isStoryFile,
  scanMetaTitle,
  scanStories,
  type ScannedStory,
} from '../../scripts/ci/story-play-functions';
import {
  INTERACTION_TAG,
  MINIMUM_COMPONENTS,
  duplicateKeys,
  formatDrift,
  interactionStoryKeys,
  junitPlayTestKeys,
  liveInteractionStories,
  playTestKeys,
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
    // Every CSF flavour Storybook loads — a non-TSX story module must not escape
    // the scan, or it could carry an unregistered `play` function.
    return isStoryFile(entry.name) ? [full] : [];
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

  it('registers each story exactly once in both of the gate comparison key spaces', () => {
    // Both drift comparisons are set-based, so a row duplicated in either key
    // space would inflate the registry without demanding a second passing play
    // test — the id space is reconciled against the live Storybook index, the
    // title+exportName space against the JUnit report.
    expect(duplicateKeys(interactionStoryKeys(manifest))).toEqual([]);
    expect(duplicateKeys(playTestKeys(manifest))).toEqual([]);
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

  it('decodes XML entities in JUnit test names', () => {
    const report: string =
      '<testcase classname="c" name="Ui &amp; Co &lt;B&gt; play-test" time="1"/>';

    expect(junitPlayTestKeys(report)).toEqual(['Ui & Co <B>']);
  });

  it('sees through `as` and `satisfies` wrappers and a direct default export', () => {
    const source: string = [
      "export default { title: 'Wrapped/Meta' } as Meta;",
      "export const Plain = { tags: ['interaction'], play: async () => {} } satisfies Story;",
    ].join('\n');

    expect(scanMetaTitle('wrapped.stories.tsx', source)).toBe('Wrapped/Meta');
    expect(scanStories('wrapped.stories.tsx', source)).toEqual([
      { exportName: 'Plain', hasPlay: true, tags: ['interaction'] },
    ]);
  });

  it('reads the title off the object `export default` names, not the first one', () => {
    // A titled helper declared ABOVE `meta` must not win: taking the first
    // declared title would key the manifest check on the wrong component.
    const source: string = [
      "const docsPage = { title: 'Decoy/NotTheMeta' };",
      "const meta = { title: 'Real/Meta', parameters: { docs: docsPage } };",
      'export default meta;',
    ].join('\n');

    expect(scanMetaTitle('decoy.stories.tsx', source)).toBe('Real/Meta');
  });

  it('reports no title when the default export is missing or is not an object', () => {
    expect(scanMetaTitle('orphan.stories.tsx', "const meta = { title: 'Orphan' };")).toBeNull();
    expect(scanMetaTitle('absent.stories.tsx', 'export default composeMeta();')).toBeNull();
    expect(scanMetaTitle('unknown.stories.tsx', 'export default notDeclaredHere;')).toBeNull();
  });

  it('treats every CSF flavour `.storybook/main.ts` loads as a story file', () => {
    // The glob there is `*.stories.@(js|jsx|mjs|ts|tsx)`; anything this predicate
    // misses is a module that can carry an unregistered `play` function.
    const loaded: string[] = ['js', 'jsx', 'mjs', 'ts', 'tsx'].map(ext => `x.stories.${ext}`);

    expect(loaded.filter(isStoryFile)).toEqual(loaded);
    expect(
      ['x.stories.mdx', 'x.story.ts', 'x.stories.ts.bak', 'stories.ts'].some(isStoryFile)
    ).toBe(false);
  });

  it('scans TypeScript-only CSF modules the same way as TSX ones', () => {
    // A bare generic arrow is valid TS but reads as an unclosed JSX tag under TSX
    // rules, so this fixture also pins the per-extension parser choice.
    const source: string = [
      'const pick = <T>(values: T[]): T => values[0];',
      "const meta = { title: 'TsOnly/Meta', args: { items: pick([[1]]) } };",
      'export default meta;',
      "export const Play = { tags: ['interaction'], play: async () => {} };",
    ].join('\n');

    expect(scanMetaTitle('ts-only.stories.ts', source)).toBe('TsOnly/Meta');
    expect(scanStories('ts-only.stories.ts', source)).toEqual([
      { exportName: 'Play', hasPlay: true, tags: ['interaction'] },
    ]);
  });

  it('walks a real directory tree and picks up every story flavour in it', () => {
    // The source-string fixtures above prove the parser; this proves the on-disk
    // discovery walk, which is what a `.stories.ts` module would have bypassed.
    const root: string = fs.mkdtempSync(path.join(os.tmpdir(), 'story-walk-'));

    try {
      fs.mkdirSync(path.join(root, 'nested'));
      ['a.stories.ts', 'b.stories.tsx', 'c.stories.mdx', 'd.ts'].forEach(name =>
        fs.writeFileSync(path.join(root, name), '')
      );
      fs.writeFileSync(path.join(root, 'nested', 'e.stories.js'), '');

      expect(
        storyFiles(root)
          .map(file => path.relative(root, file))
          .sort()
      ).toEqual(['a.stories.ts', 'b.stories.tsx', path.join('nested', 'e.stories.js')]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports every key a manifest lists more than once', () => {
    expect(duplicateKeys(['b', 'a', 'b', 'c', 'a'])).toEqual(['a', 'b']);
    expect(duplicateKeys(['a', 'b'])).toEqual([]);
    expect(playTestKeys([{ id: 'i', title: 'T', name: 'N', exportName: 'E' }])).toEqual(['T E']);
  });

  it('reports both missing and unregistered keys', () => {
    expect(formatDrift(['a', 'b'], ['b', 'c'])).toBe('  - missing: a\n  - unregistered: c');
    expect(formatDrift(['a'], ['a'])).toBeNull();
  });
});
