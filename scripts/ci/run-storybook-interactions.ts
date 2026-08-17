/**
 * Fail-closed entry point for the Storybook interaction (play function) suite.
 *
 * `@storybook/test-runner --includeTags interaction` turns every story file that
 * carries no interaction story into `describe.skip(… no-op)`, so Jest happily
 * exits 0 when the tag disappears from the whole library. That silent-skip hole is
 * exactly what issue #100 forbids, so this wrapper brackets the run with two
 * reconciliations against `tests/storybook/interaction-stories.json`:
 *
 *  1. BEFORE — the live Storybook index must expose exactly the manifest's
 *     interaction-tagged stories, covering at least MINIMUM_COMPONENTS components.
 *  2. AFTER  — the JUnit report must contain one PASSING `play-test` per manifest
 *     entry, with no failures, errors or skips among them.
 *
 * Usage: bun scripts/ci/run-storybook-interactions.ts [manifest-path]
 *   The Storybook URL comes from REACT_APP_STORYBOOK_URL (the `playwright` compose
 *   service sets it), falling back to http://127.0.0.1:6006.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  MINIMUM_COMPONENTS,
  formatDrift,
  interactionStoryKeys,
  junitPlayTestKeys,
  liveInteractionStories,
  type InteractionStory,
} from './storybook-interaction-manifest';

const DEFAULT_MANIFEST = 'tests/storybook/interaction-stories.json';
const DEFAULT_URL = 'http://127.0.0.1:6006';
const REPORT_DIR = 'reports/storybook';
const REPORT_NAME = 'interactions.xml';

function fail(message: string): never {
  console.error(`storybook interaction gate: ${message}`);
  process.exit(1);
}

function readManifest(path: string): InteractionStory[] {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as InteractionStory[];
  } catch (error) {
    return fail(`cannot read the interaction manifest at ${path}: ${String(error)}`);
  }
}

async function fetchLiveStories(url: string): Promise<InteractionStory[]> {
  const response = await fetch(`${url}/index.json`);
  if (!response.ok) {
    return fail(`GET ${url}/index.json returned ${response.status}`);
  }
  return liveInteractionStories(await response.json());
}

function assertManifestMatchesIndex(manifest: InteractionStory[], live: InteractionStory[]): void {
  if (manifest.length === 0) {
    fail('the interaction manifest is empty — interaction coverage may only grow.');
  }

  const components: Set<string> = new Set(manifest.map(story => story.title));
  if (components.size < MINIMUM_COMPONENTS) {
    fail(`only ${components.size} components carry interactions; at least ${MINIMUM_COMPONENTS}`);
  }

  const drift: string | null = formatDrift(
    interactionStoryKeys(manifest),
    interactionStoryKeys(live)
  );
  if (drift) {
    fail(`the manifest and the live Storybook index disagree:\n${drift}`);
  }
}

function runTestRunner(url: string): void {
  const result = spawnSync(
    'bun',
    [
      'x',
      'test-storybook',
      '--url',
      url,
      // CSF mode: index-json mode emits an EMPTY describe for every filtered-out
      // story file, which Jest rejects as "must contain at least one test".
      '--no-index-json',
      '--includeTags',
      'interaction',
      '--browsers',
      'chromium',
      '--maxWorkers',
      '2',
      // A cold Storybook dev server compiles on the first navigation, so the
      // default 15s per-test budget is too tight for the first few stories.
      '--testTimeout',
      '60000',
      '--junit',
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        JEST_JUNIT_OUTPUT_DIR: REPORT_DIR,
        JEST_JUNIT_OUTPUT_NAME: REPORT_NAME,
      },
    }
  );

  if (result.status !== 0) {
    fail(`the interaction suite failed (test-storybook exited with ${String(result.status)})`);
  }
}

function assertEveryStoryRan(manifest: InteractionStory[]): void {
  const reportPath: string = resolve(REPORT_DIR, REPORT_NAME);
  let report: string;

  try {
    report = readFileSync(reportPath, 'utf8');
  } catch (error) {
    return fail(`no JUnit report at ${reportPath}: ${String(error)}`);
  }

  const drift: string | null = formatDrift(
    manifest.map(story => `${story.title} ${story.exportName}`),
    junitPlayTestKeys(report)
  );

  if (drift) {
    fail(`the executed play tests do not match the manifest:\n${drift}`);
  }
}

async function main(): Promise<void> {
  const manifestPath: string = resolve(process.argv[2] ?? DEFAULT_MANIFEST);
  const url: string = (process.env.REACT_APP_STORYBOOK_URL ?? DEFAULT_URL).replace(/\/+$/, '');
  const manifest: InteractionStory[] = readManifest(manifestPath);

  assertManifestMatchesIndex(manifest, await fetchLiveStories(url));
  runTestRunner(url);
  assertEveryStoryRan(manifest);

  console.log(`storybook interaction gate: ${manifest.length} play tests passed.`);
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
