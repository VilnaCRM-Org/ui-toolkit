import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import * as publicComponents from '../../src/components';

// Stories 1.4, 2.6 and 3.6 (#27/#28/#29) — the epic quality-gate closure guard.
// Each closure story pins its epic's delivered set to four machine-checked
// surfaces: a Storybook story module, a behaviour-level unit suite, a public
// barrel export and a registered visual baseline. The closure artifacts in
// `specs/implementation-artifacts/` cite this suite as their enforcement, so a
// component cannot silently lose a story, its unit suite, its export or its
// visual registration after the epic is signed off.
//
// A failure here is closed by restoring the missing surface — never by
// removing the component from its epic's delivered set, which is fixed by
// `specs/planning-artifacts/epics.md`.

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const COMPONENTS_DIR: string = 'src/components';
const UNIT_TESTS_DIR: string = 'tests/unit';
const ARTIFACTS_DIR: string = 'specs/implementation-artifacts';
const STORIES_MANIFEST_PATH: string = 'tests/visual/stories.json';
const STORYBOOK_TITLE_PREFIX: string = 'UiComponents/';

interface EpicGate {
  epic: string;
  artifact: string;
  modules: string[];
}

// The delivered sets come verbatim from the closure stories' acceptance
// criteria (`specs/planning-artifacts/epics.md` — Stories 1.4, 2.6, 3.6).
const EPIC_GATES: EpicGate[] = [
  {
    epic: 'Epic 1',
    artifact: '1-4-epic-1-quality-gate-closure.md',
    modules: ['ui-button', 'ui-input', 'ui-checkbox', 'ui-link'],
  },
  {
    epic: 'Epic 2',
    artifact: '2-6-epic-2-quality-gate-closure.md',
    modules: [
      'ui-search-input',
      'ui-select-with-search',
      'ui-multi-select',
      'ui-calendar-multi-select',
      'ui-radio-group',
      'ui-file-upload-input',
      'ui-pagination',
    ],
  },
  {
    epic: 'Epic 3',
    artifact: '3-6-epic-3-quality-gate-closure.md',
    modules: [
      'ui-item-row',
      'ui-items-list',
      'ui-task-card',
      'ui-profile-select-card',
      'ui-integration-card',
      'ui-filter-chip',
      'ui-pin-input',
      'ui-payment-option-card',
      'ui-action-icon-bar',
      'ui-status-badge',
      'ui-notification-badge',
    ],
  },
];

interface GatedModule {
  epic: string;
  module: string;
  exportName: string;
}

/** `ui-select-with-search` → `UiSelectWithSearch` — the barrel naming rule. */
function exportNameFor(module: string): string {
  return module
    .split('-')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function gatedModules(gate: EpicGate): GatedModule[] {
  return gate.modules.map(module => ({
    epic: gate.epic,
    module,
    exportName: exportNameFor(module),
  }));
}

const allGatedModules: GatedModule[] = EPIC_GATES.flatMap(gatedModules);
const runtimeExports: string[] = Object.keys(publicComponents);

interface RegisteredStory {
  id: string;
  title: string;
  name: string;
}

const registeredStories: RegisteredStory[] = JSON.parse(
  readFileSync(join(REPO_ROOT, STORIES_MANIFEST_PATH), 'utf8')
);

function registeredTitles(exportName: string): RegisteredStory[] {
  return registeredStories.filter(
    story => story.title === `${STORYBOOK_TITLE_PREFIX}${exportName}`
  );
}

function storyModules(module: string): string[] {
  const dir: string = join(REPO_ROOT, COMPONENTS_DIR, module);
  return readdirSync(dir).filter(name => name.endsWith('.stories.tsx'));
}

// Registry-style suites name every export by construction, so a hit inside
// one of them is not behaviour evidence. Excluding them is a ruling: the unit
// surface a closure story signs off is a suite that exercises the component,
// not a list that enumerates it.
const REGISTRY_SUITES: string[] = [
  'epic-quality-gate-closure.test.ts',
  'components-index.test.ts',
  'export-contract-integrity.test.ts',
  'component-provenance-traceability.test.ts',
  'board-coverage-traceability.test.ts',
];

interface UnitSuite {
  file: string;
  body: string;
}

function unitSuites(): UnitSuite[] {
  return readdirSync(join(REPO_ROOT, UNIT_TESTS_DIR))
    .filter(name => /\.test\.tsx?$/.test(name))
    .filter(name => !REGISTRY_SUITES.includes(name))
    .map(file => ({ file, body: readFileSync(join(REPO_ROOT, UNIT_TESTS_DIR, file), 'utf8') }));
}

const behaviourSuites: UnitSuite[] = unitSuites();

function behaviourSuitesNaming(exportName: string): string[] {
  return behaviourSuites.filter(suite => suite.body.includes(exportName)).map(suite => suite.file);
}

function artifactBody(gate: EpicGate): string {
  return readFileSync(join(REPO_ROOT, ARTIFACTS_DIR, gate.artifact), 'utf8');
}

/** Repo-relative `src/…` / `tests/…` / `specs/…` citations with line suffixes dropped. */
function citedRepoPaths(text: string): string[] {
  return [...text.matchAll(/`((?:src|tests|specs)\/[^`\n]+)`/g)]
    .map(match => match[1].replace(/:[\d,-]+$/, ''))
    .filter(path => !path.includes('…'));
}

function missingCitedPaths(gate: EpicGate): string[] {
  return citedRepoPaths(artifactBody(gate)).filter(path => !existsSync(join(REPO_ROOT, path)));
}

describe('epic quality-gate closure', () => {
  describe('closure artifacts are bound to the tree', () => {
    it.each(EPIC_GATES)('$epic closure artifact exists', gate => {
      expect(existsSync(join(REPO_ROOT, ARTIFACTS_DIR, gate.artifact))).toBe(true);
    });

    it.each(EPIC_GATES)('$epic closure artifact names every gated module', gate => {
      const body: string = artifactBody(gate);
      expect(gate.modules.filter(module => !body.includes(`\`${module}\``))).toEqual([]);
    });

    it.each(EPIC_GATES)('$epic closure artifact cites only paths that exist', gate => {
      expect(missingCitedPaths(gate)).toEqual([]);
    });

    it.each(EPIC_GATES)('$epic closure artifact names this guard as its enforcement', gate => {
      expect(artifactBody(gate)).toContain('tests/unit/epic-quality-gate-closure.test.ts');
    });
  });

  describe('every gated component keeps its four closure surfaces', () => {
    it.each(allGatedModules)('$module ships a Storybook story module', ({ module }) => {
      expect(storyModules(module).length).toBeGreaterThan(0);
    });

    it.each(allGatedModules)(
      '$exportName is exercised by a behaviour-level unit suite',
      ({ exportName }) => {
        expect(behaviourSuitesNaming(exportName).length).toBeGreaterThan(0);
      }
    );

    it.each(allGatedModules)('$exportName is exported from the public barrel', ({ exportName }) => {
      expect(runtimeExports).toContain(exportName);
    });

    it.each(allGatedModules)(
      '$exportName has at least one registered visual baseline',
      ({ exportName }) => {
        expect(registeredTitles(exportName).length).toBeGreaterThan(0);
      }
    );
  });
});
