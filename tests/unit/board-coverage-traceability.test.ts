import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import barrelExportNames from './utils/barrel-export-names';

// Story 5.1 (#31) — drift guard for the canonical board coverage checklist
// (`prd.md` FR-01, §5.6, §9.1). The checklist is the release's traceability
// artifact, so it is machine-checked rather than reviewed by eye.
//
// A row whose status is neither `Done` nor `Non-goal` fails this suite by
// design: `epics.md` Story 5.1 requires unresolved board elements to be visible
// and treated as blockers. A failure here is closed by delivering the element or
// by recording an explicit non-goal decision — never by widening the token set.

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const CHECKLIST_RELATIVE_PATH: string = 'specs/planning-artifacts/board-coverage-checklist.md';
const CHECKLIST_PATH: string = join(REPO_ROOT, CHECKLIST_RELATIVE_PATH);
const BARREL_PATH: string = join(REPO_ROOT, 'src/components/index.ts');

const BOARD_LETTERS: string[] = ['A', 'B', 'C', 'D'];
const RESOLVED_STATUSES: string[] = ['Done', 'Non-goal'];
const BOARD_COLUMN_COUNT: number = 7;
const ROLL_UP_COLUMN_COUNT: number = 6;
const ROLL_UP_TOTAL_LABEL: string = '**Total**';
const VERDICT_ELEMENT_COUNT: RegExp = /status:\s*[A-Z]+\*\*[^\d]*(\d+)\s+elements/;

const checklist: string = readFileSync(CHECKLIST_PATH, 'utf8');
const barrel: string = readFileSync(BARREL_PATH, 'utf8');
// The public barrel is deliberately NOT imported here. `mutation-runner-scope`
// pins a hard invariant that only two structural guards may import it: a barrel
// import makes every suite "related" to every mutant, which is what blew the
// mutation run out to ~2h before #141/#142. This guard only needs the export
// NAMES, and those are derivable from the barrel's own source text — by the
// shared parser, which Story 5.2's registry guard reads the same way.
const runtimeExports: string[] = barrelExportNames(barrel);

// A checklist row's Export cell, plus the first column of the "exports outside
// board scope" appendix. Scoped deliberately: matching the NAME anywhere in the
// document would let a new export satisfy this guard by appearing in unrelated
// prose, which is precisely the drift the bidirectional check exists to catch.
function appendixExportNames(): string[] {
  const heading: string = '## Appendix — exports outside board scope';
  const start: number = checklist.indexOf(heading);
  if (start === -1) {
    return [];
  }
  const section: string = checklist.slice(start);
  return allTableRows(section).flatMap(cells => backticked(cellAt(cells, 0)));
}

function trackedExportNames(): string[] {
  const fromBoards: string[] = allRows.flatMap(row => backticked(row.exports));
  return [...new Set([...fromBoards, ...appendixExportNames()])];
}

// Story ids as Storybook derives them: `<kebab-title>--<kebab-story>`. The
// Storybook cell also backticks the story FILE path, which this must not match.
const STORY_ID: RegExp = /^[a-z0-9]+(?:-[a-z0-9]+)*--[a-z0-9]+(?:-[a-z0-9]+)*$/;

function citedStoryIds(row: BoardRow): string[] {
  return backticked(row.storybook).filter(token => STORY_ID.test(token));
}

interface StoryManifestEntry {
  id: string;
}

const manifestStoryIds: string[] = (
  JSON.parse(
    readFileSync(join(REPO_ROOT, 'tests/visual/stories.json'), 'utf8')
  ) as StoryManifestEntry[]
).map(entry => entry.id);

interface BoardRow {
  board: string;
  element: string;
  component: string;
  status: string;
  exports: string;
  storybook: string;
  unitTests: string;
}

/** Body of a `## Board <letter> — …` section, up to the next `##` heading. */
function boardSection(letter: string): string {
  const start: number = checklist.indexOf(`\n## Board ${letter} `);
  const body: string = start < 0 ? '' : checklist.slice(start + 1);
  const end: number = body.indexOf('\n## ');
  return end < 0 ? body : body.slice(0, end);
}

// Prettier pads every cell and keeps the outer pipes, so both edges are stripped
// before splitting: the parse depends on the column count, not on the padding.
function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function allTableRows(markdown: string): string[][] {
  return markdown
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .map(tableCells);
}

// `noUncheckedIndexedAccess` types every index read as possibly-undefined, and
// these rows are parsed from a markdown file rather than a typed source. Reading
// a missing cell as '' keeps the parse total without an assertion: a malformed
// row then fails the guard's own assertions below, which is the correct outcome,
// instead of throwing here with no indication of which row was wrong.
function cellAt(cells: string[], index: number): string {
  return cells[index] ?? '';
}

/** Board data rows only — drops the header row and the `---` separator row. */
function isBoardRow(cells: string[]): boolean {
  const status: string = cellAt(cells, 2);
  return cells.length === BOARD_COLUMN_COUNT && status !== 'Status' && !/^:?-{3,}:?$/.test(status);
}

function toBoardRow(board: string, cells: string[]): BoardRow {
  return {
    board,
    element: cellAt(cells, 0),
    component: cellAt(cells, 1),
    status: cellAt(cells, 2),
    exports: cellAt(cells, 3),
    storybook: cellAt(cells, 4),
    unitTests: cellAt(cells, 5),
  };
}

function boardRows(letter: string): BoardRow[] {
  return allTableRows(boardSection(letter))
    .filter(isBoardRow)
    .map(cells => toBoardRow(letter, cells));
}

const allRows: BoardRow[] = BOARD_LETTERS.flatMap(boardRows);
const doneRows: BoardRow[] = allRows.filter(row => row.status === 'Done');

/** Every backticked span in a cell: `UiButton`, `src/…/x.stories.tsx`, story ids. */
function backticked(cell: string): string[] {
  return [...cell.matchAll(/`([^`]+)`/g)]
    .map(match => match[1])
    .filter((token): token is string => token !== undefined);
}

// The component column also backticks prop shorthands (`variant="outlined"`,
// `size="small"`, `socialButton`), which are not exports. Only `Ui`-prefixed
// identifiers name a component the barrel has to expose.
function componentIdentifiers(row: BoardRow): string[] {
  return backticked(row.component).filter(token => /^Ui[A-Z]\w*$/.test(token));
}

function repoPaths(cell: string): string[] {
  return backticked(cell).filter(token => /^(src|tests)\//.test(token));
}

function missingPaths(cell: string): string[] {
  return repoPaths(cell).filter(relativePath => !existsSync(join(REPO_ROOT, relativePath)));
}

// The export column lists type-only names too (`UiFilterChipProps`,
// `ItemRowMethod`, …), which a runtime key sweep cannot see, so it is checked
// against the barrel's source text instead.
function unknownBarrelNames(row: BoardRow): string[] {
  return backticked(row.exports)
    .filter(name => /^\w+$/.test(name))
    .filter(name => !new RegExp(`\\b${name}\\b`).test(barrel));
}

function tallyStatus(rows: BoardRow[], status: string): number {
  return rows.filter(row => row.status === status).length;
}

/** `[elements, Done, Non-goal, Blocked]` — the roll-up table's column order. */
function tally(rows: BoardRow[]): number[] {
  return [
    rows.length,
    tallyStatus(rows, 'Done'),
    tallyStatus(rows, 'Non-goal'),
    tallyStatus(rows, 'Blocked'),
  ];
}

function rollUpCounts(label: string): number[] {
  const row: string[] =
    allTableRows(checklist).find(
      cells => cells.length === ROLL_UP_COLUMN_COUNT && cells[0] === label
    ) ?? [];
  return row.slice(1, 5).map(cell => Number(cell.replace(/\*/g, '')));
}

/** Element count claimed by a section's `**Board X status: …**` verdict line. */
function declaredElementCount(letter: string): number {
  return Number(boardSection(letter).match(VERDICT_ELEMENT_COUNT)?.[1]);
}

describe('board coverage checklist traceability', () => {
  describe('canonical checklist', () => {
    it('exists at the path the PRD mandates', () => {
      expect(existsSync(CHECKLIST_PATH)).toBe(true);
    });

    it.each(BOARD_LETTERS)('carries a Board %s section with parsed rows', letter => {
      expect(boardSection(letter)).not.toBe('');
      expect(boardRows(letter).length).toBeGreaterThan(0);
    });
  });

  describe('blocker gate', () => {
    it.each(allRows)(
      'Board $board — $element — is resolved (Done or Non-goal), not an open blocker',
      row => {
        expect(RESOLVED_STATUSES).toContain(row.status);
      }
    );
  });

  describe('delivered rows carry verifiable evidence', () => {
    it.each(doneRows)('$element names at least one Ui component identifier', row => {
      expect(componentIdentifiers(row).length).toBeGreaterThan(0);
    });

    it.each(doneRows)('$element maps to runtime exports of src/components', row => {
      expect(runtimeExports).toEqual(expect.arrayContaining(componentIdentifiers(row)));
    });

    it.each(doneRows)('$element lists export names the barrel declares', row => {
      expect(unknownBarrelNames(row)).toEqual([]);
    });

    it.each(doneRows)('$element cites Storybook files that exist on disk', row => {
      expect(repoPaths(row.storybook).length).toBeGreaterThan(0);
      expect(missingPaths(row.storybook)).toEqual([]);
    });

    it.each(doneRows)('$element cites Storybook ids that the manifest still defines', row => {
      // The file-existence check above cannot see a story that was renamed or
      // deleted inside a file that still exists, so the cited id is resolved
      // against the visual manifest — the same list the screenshot loop iterates.
      expect(manifestStoryIds).toEqual(expect.arrayContaining(citedStoryIds(row)));
    });

    it.each(doneRows)('$element cites unit test files that exist on disk', row => {
      expect(repoPaths(row.unitTests).length).toBeGreaterThan(0);
      expect(missingPaths(row.unitTests)).toEqual([]);
    });
  });

  // Bidirectional guard: a newly delivered component cannot reach the public
  // surface without being tracked, either as a board row or as a documented
  // out-of-scope export in the appendix.
  describe('every public export is tracked', () => {
    it.each(runtimeExports)('%s appears in a board row or the out-of-scope appendix', name => {
      expect(trackedExportNames()).toContain(name);
    });
  });

  describe('declared counts match the parsed rows', () => {
    it.each(BOARD_LETTERS)('Board %s verdict line counts the rows above it', letter => {
      expect(declaredElementCount(letter)).toBe(boardRows(letter).length);
    });

    it.each(BOARD_LETTERS)('Board %s roll-up row matches its parsed statuses', letter => {
      expect(rollUpCounts(letter)).toEqual(tally(boardRows(letter)));
    });

    it('roll-up total matches every parsed board row', () => {
      expect(rollUpCounts(ROLL_UP_TOTAL_LABEL)).toEqual(tally(allRows));
    });
  });
});
