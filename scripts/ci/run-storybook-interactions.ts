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
 *   The manifest path is optional and must stay inside the project root. The
 *   Storybook URL comes from REACT_APP_STORYBOOK_URL (the `playwright` compose
 *   service sets it), falling back to http://127.0.0.1:6006.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

import {
  MINIMUM_COMPONENTS,
  formatDrift,
  interactionStoryKeys,
  junitPlayTestKeys,
  liveInteractionStories,
  type InteractionStory,
} from './storybook-interaction-manifest';

const PROJECT_ROOT: string = resolve(process.cwd());
const DEFAULT_MANIFEST: string = 'tests/storybook/interaction-stories.json';
const DEFAULT_URL: string = 'http://127.0.0.1:6006';
const REPORT_DIR: string = 'reports/storybook';
const REPORT_NAME: string = 'interactions.xml';

function fail(message: string): never {
  process.stderr.write(`storybook interaction gate: ${message}\n`);
  process.exit(1);
}

/**
 * Resolves the manifest argument against the project root and refuses anything
 * that escapes it, so a caller-supplied path can never make this gate read (and
 * then trust) a file from outside the repository.
 */
function resolveManifestPath(candidate: string): string {
  const resolved: string = resolve(PROJECT_ROOT, candidate);
  const relativeToRoot: string = relative(PROJECT_ROOT, resolved);

  if (relativeToRoot === '' || relativeToRoot.startsWith('..') || isAbsolute(relativeToRoot)) {
    fail('refusing to read an interaction manifest from outside the project root');
  }

  return resolved;
}

function readManifest(path: string): InteractionStory[] {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as InteractionStory[];
  } catch {
    return fail('the interaction manifest is missing or is not valid JSON');
  }
}

/** Drops trailing slashes without a backtracking-prone regex. */
function trimTrailingSlashes(url: string): string {
  let end: number = url.length;
  while (end > 0 && url.charAt(end - 1) === '/') {
    end -= 1;
  }
  return url.slice(0, end);
}

async function fetchLiveStories(url: string): Promise<InteractionStory[]> {
  const response: Response = await fetch(`${url}/index.json`);

  if (!response.ok) {
    return fail(`the Storybook index request failed with status ${response.status}`);
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
  // `process.execPath` is the absolute path of the Bun binary already running this
  // script, so the child is never resolved through PATH.
  const result = spawnSync(
    process.execPath,
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
  const reportPath: string = resolve(PROJECT_ROOT, REPORT_DIR, REPORT_NAME);
  let report: string;

  try {
    report = readFileSync(reportPath, 'utf8');
  } catch {
    return fail('the interaction suite produced no JUnit report');
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
  const manifestPath: string = resolveManifestPath(process.argv[2] ?? DEFAULT_MANIFEST);
  const url: string = trimTrailingSlashes(process.env.REACT_APP_STORYBOOK_URL ?? DEFAULT_URL);
  const manifest: InteractionStory[] = readManifest(manifestPath);

  assertManifestMatchesIndex(manifest, await fetchLiveStories(url));
  runTestRunner(url);
  assertEveryStoryRan(manifest);

  process.stdout.write(`storybook interaction gate: ${manifest.length} play tests passed.\n`);
}

main().catch((error: unknown) => {
  fail(`the gate crashed: ${error instanceof Error ? error.message : 'unknown error'}`);
});
