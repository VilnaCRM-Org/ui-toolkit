/**
 * Pure helpers shared by the Storybook interaction gate
 * ({@link ./run-storybook-interactions.ts}) and its unit tests.
 *
 * The manifest at `tests/storybook/interaction-stories.json` is the registry of
 * stories that MUST carry a `play` function. Keeping the comparison logic pure
 * here lets the unit tier assert the gate's behaviour without booting Storybook.
 */

/** Registry row: one story that must carry a `play` function. */
export interface InteractionStory {
  /** Storybook story id, e.g. `uicomponents-uibutton--click-invokes-handler`. */
  id: string;
  /** Component title, e.g. `UiComponents/UiButton`. */
  title: string;
  /** Display name, e.g. `Click Invokes Handler`. */
  name: string;
  /** CSF export, e.g. `ClickInvokesHandler` — how the JUnit report names the test. */
  exportName: string;
}

/** The Storybook tag that routes a story into the interaction suite. */
export const INTERACTION_TAG: string = 'interaction';

/**
 * Coverage floor from issue #100 ("≥ 8 interactive components have play
 * functions"). It is a floor, never a target: raise it, never lower it.
 */
export const MINIMUM_COMPONENTS: number = 8;

interface RawIndexEntry {
  type?: string;
  id?: string;
  title?: string;
  name?: string;
  exportName?: string;
  tags?: string[];
}

function isInteractionEntry(entry: RawIndexEntry): boolean {
  return entry.type === 'story' && (entry.tags ?? []).includes(INTERACTION_TAG);
}

/** Extracts the interaction-tagged stories from a live Storybook `index.json`. */
export function liveInteractionStories(index: unknown): InteractionStory[] {
  const entries: Record<string, RawIndexEntry> =
    (index as { entries?: Record<string, RawIndexEntry> })?.entries ?? {};

  return Object.values(entries)
    .filter(isInteractionEntry)
    .map(entry => ({
      id: entry.id ?? '',
      title: entry.title ?? '',
      name: entry.name ?? '',
      exportName: entry.exportName ?? '',
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Stable comparison keys for a set of interaction stories. */
export function interactionStoryKeys(stories: InteractionStory[]): string[] {
  return stories.map(story => `${story.id} (${story.title} / ${story.exportName})`);
}

const TEST_CASE = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
const CASE_NAME = /\bname="([^"]*)"/;
const NOT_PASSED = /<(?:failure|error|skipped)\b/;
const PLAY_TEST_SUFFIX = / play-test$/;

/**
 * Names of the play tests that actually PASSED, read from a jest-junit report.
 * A skipped or failed case carries a `<skipped/>` / `<failure>` / `<error>` child,
 * so only `play-test` cases with an empty body count as executed proof — that is
 * what makes a silently-skipped interaction suite fail the gate.
 */
export function junitPlayTestKeys(report: string): string[] {
  return [...report.matchAll(TEST_CASE)]
    .map(match => ({ name: CASE_NAME.exec(match[1])?.[1] ?? '', body: match[2] ?? '' }))
    .filter(entry => PLAY_TEST_SUFFIX.test(entry.name) && !NOT_PASSED.test(entry.body))
    .map(entry => entry.name.replace(PLAY_TEST_SUFFIX, ''))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Compares two key sets, returning a human-readable drift report or `null` when
 * they are identical.
 */
export function formatDrift(expected: string[], actual: string[]): string | null {
  const expectedSet: Set<string> = new Set(expected);
  const actualSet: Set<string> = new Set(actual);
  const missing: string[] = expected.filter(key => !actualSet.has(key)).sort();
  const unexpected: string[] = actual.filter(key => !expectedSet.has(key)).sort();

  if (missing.length === 0 && unexpected.length === 0) {
    return null;
  }

  const lines: string[] = [];
  missing.forEach(key => lines.push(`  - missing: ${key}`));
  unexpected.forEach(key => lines.push(`  - unregistered: ${key}`));

  return lines.join('\n');
}
