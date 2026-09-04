import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import * as publicComponents from '../../src/components';

import nthOf from './utils/nth-of';

// Story 5.2 (#32) — drift guard for the provenance registry, the deviation
// ledger and the Definition-of-Done compliance matrix (`prd.md` FR-07, §3.2-§3.5;
// `epics.md` Story 5.2). Before this suite existed nothing in `tests/`, `scripts/`,
// the `Makefile` or `.github/` read `component-provenance.md`, which is why
// thirteen exported modules sat unrecorded and a superseded `UiActionIconBar`
// claim survived commit `e248c4b`.
//
// The three artifacts are one machine-checked surface: a module cannot reach the
// public barrel without a registry row, a row cannot cite a deviation that has no
// ledger id, a ledger row cannot carry a token outside its closed set, and a code
// comment cannot declare a deviation without a `DEV-nn` tag.
//
// A failure here is closed by recording evidence — writing the row, filing the
// ledger entry, tagging the code site — never by widening the token set,
// relaxing a citation requirement or deleting a row.

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const PLANNING_DIR: string = 'specs/planning-artifacts';
const IMPLEMENTATION_DIR: string = 'specs/implementation-artifacts';
const DOD_ARTIFACT_NAME: string = '5-2-reuse-canonical-compliance-and-provenance-completion.md';
const REGISTRY_RELATIVE_PATH: string = `${PLANNING_DIR}/component-provenance.md`;
const LEDGER_RELATIVE_PATH: string = `${PLANNING_DIR}/deviation-ledger.md`;
const DOD_RELATIVE_PATH: string = `${IMPLEMENTATION_DIR}/${DOD_ARTIFACT_NAME}`;
const SPRINT_STATUS_RELATIVE_PATH: string = `${IMPLEMENTATION_DIR}/sprint-status.yaml`;

const SOURCE_TOKENS: string[] = ['`crm`', '`website`', '`new`'];
const KIND_TOKENS: string[] = [
  'contract-exception',
  'visual-parity',
  'a11y-conformance',
  'reuse-deviation',
  'non-goal',
];
const STATUS_TOKENS: string[] = [
  'ratified',
  'pending-ratification',
  'escalated',
  'deferred-tracked',
  'superseded',
];
const VERDICT_TOKENS: string[] = ['Complete', 'Evidence-elsewhere', 'Gap'];

const REGISTRY_COLUMN_COUNT: number = 4;
const LEDGER_COLUMN_COUNT: number = 9;
const MATRIX_COLUMN_COUNT: number = 9;
const MATRIX_SECTION_CELLS: number[] = [1, 2, 3, 4, 5, 6];
const MIN_EVIDENCE_LENGTH: number = 80;
const ROLL_UP_TOTAL_LABEL: string = '**Total**';
const SEPARATOR_CELL: RegExp = /^:?-{3,}:?$/;

function readRepoFile(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
}

const registry: string = readRepoFile(REGISTRY_RELATIVE_PATH);
const ledger: string = readRepoFile(LEDGER_RELATIVE_PATH);
const dodArtifact: string = readRepoFile(DOD_RELATIVE_PATH);
const runtimeExports: string[] = Object.keys(publicComponents);

// Prettier pads every cell and keeps the outer pipes, and it escapes a pipe that
// belongs to the prose as `\|` (`size: small\|medium`). Splitting on unescaped
// pipes only is what keeps a row's column count stable.
function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function allTableRows(markdown: string): string[][] {
  return markdown
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .map(tableCells);
}

/** Every backticked span in a cell: `UiButton`, `src/…/styles.ts:12`, `internal`. */
function backticked(cell: string): string[] {
  return [...cell.matchAll(/`([^`\n]+)`/g)].map(match => nthOf(match, 1));
}

// CRM's own tree names its skeleton directory `src/components/skeletons`; the
// toolkit renamed it to `ui-skeletons`. The Epic 4 rows cite the upstream path as
// provenance evidence, so it is a citation of another repository and must not be
// resolved against this one. Elided paths (`…`) are prose, not citations.
const UPSTREAM_PATH_PREFIXES: string[] = ['src/components/skeletons/'];

function isRepoPathCitation(token: string): boolean {
  if (!/^(src|tests)\//.test(token) || token.includes('…')) {
    return false;
  }
  return !UPSTREAM_PATH_PREFIXES.some(prefix => token.startsWith(prefix));
}

/** Repo-relative paths cited in a cell, with any `:12-18` line suffix dropped. */
function repoPaths(text: string): string[] {
  return backticked(text)
    .filter(isRepoPathCitation)
    .map(token => token.replace(/:[\d,-]+$/, ''));
}

function missingPaths(text: string): string[] {
  return repoPaths(text).filter(path => !existsSync(join(REPO_ROOT, path)));
}

// ---------------------------------------------------------------------------
// Registry — `specs/planning-artifacts/component-provenance.md`
// ---------------------------------------------------------------------------

// The `## Scope` row key: `` `<ExportedName>` (`<src/components/… path>`) ``,
// optionally followed by ` · `internal`` when the subject is off the barrel.
const REGISTRY_ROW_KEY: RegExp = /^`([^`]+)` \(`(src\/components\/[^`]+)`\)/;

interface RegistryRow {
  name: string;
  modulePath: string;
  internal: boolean;
  source: string;
  rationale: string;
  alignment: string;
  names: string[];
}

function isRegistryRow(cells: string[]): boolean {
  return cells.length === REGISTRY_COLUMN_COUNT && REGISTRY_ROW_KEY.test(nthOf(cells, 0));
}

// The Component cell also names the symbols a token module re-exports
// (`UiColorTheme` … "also exports `crmColorTheme`, …"), so the whole
// theme/breakpoint surface resolves through its two rows.
function componentNames(cell: string): string[] {
  return backticked(cell).filter(token => !token.startsWith('src/') && token !== 'internal');
}

function toRegistryRow(cells: string[]): RegistryRow {
  const component: string = nthOf(cells, 0);
  const key: RegExpMatchArray = component.match(REGISTRY_ROW_KEY) as RegExpMatchArray;
  return {
    name: nthOf(key, 1),
    modulePath: nthOf(key, 2),
    internal: component.includes('`internal`'),
    source: nthOf(cells, 1),
    rationale: nthOf(cells, 2),
    alignment: nthOf(cells, 3),
    names: componentNames(component),
  };
}

const registryRows: RegistryRow[] = allTableRows(registry).filter(isRegistryRow).map(toRegistryRow);
const registryNames: string[] = registryRows.flatMap(row => row.names);
const exportedRegistryNames: string[] = registryRows
  .filter(row => !row.internal)
  .flatMap(row => row.names);

/** The `## Scope` preamble, which carries the excluded-module table. */
function scopeSection(): string {
  return registry.slice(registry.indexOf('## Scope'), registry.indexOf('## Registry'));
}

const scopeExcludedModules: string[] = allTableRows(scopeSection())
  .flatMap(cells => backticked(nthOf(cells, 0)))
  .filter(token => token.startsWith('src/components/'));

/** `src/components/<module>` — the module a row or an exclusion is keyed to. */
function moduleRoot(path: string): string {
  return path.split('/').slice(0, 3).join('/');
}

const registeredModules: string[] = registryRows.map(row => moduleRoot(row.modulePath));

function componentDirEntries(): string[] {
  return readdirSync(join(REPO_ROOT, 'src/components')).filter(name => name !== 'index.ts');
}

function isTrackedModule(entry: string): boolean {
  const path: string = `src/components/${entry}`;
  return registeredModules.includes(path) || scopeExcludedModules.includes(path);
}

const DEVIATION_LABEL: string = 'Deviations:';

/** Text after the row's final `Deviations:` label — the row's closing clause. */
function deviationClause(row: RegistryRow): string {
  const at: number = row.alignment.lastIndexOf(DEVIATION_LABEL);
  return at < 0 ? '' : row.alignment.slice(at + DEVIATION_LABEL.length).trim();
}

// `none` may carry a parenthetical ("none (only the Epic 4 shared non-animation
// set …)"), so the token is matched at the head of the clause. Anything else has
// to be a list of ledger ids: prose alone is not a deviation record.
function hasClosedDeviationClause(row: RegistryRow): boolean {
  const clause: string = deviationClause(row);
  return /^none\b/.test(clause) || /^DEV-\d+\b/.test(clause);
}

function citedDeviationIds(row: RegistryRow): string[] {
  return [...deviationClause(row).matchAll(/DEV-\d+/g)].map(match => match[0]);
}

// ---------------------------------------------------------------------------
// Ledger — `specs/planning-artifacts/deviation-ledger.md`
// ---------------------------------------------------------------------------

interface LedgerRow {
  id: string;
  module: string;
  justification: string;
  kind: string;
  status: string;
  owner: string;
  recordedWhere: string;
}

function isLedgerRow(cells: string[]): boolean {
  return cells.length === LEDGER_COLUMN_COUNT && /^DEV-\d+$/.test(nthOf(cells, 0));
}

function toLedgerRow(cells: string[]): LedgerRow {
  return {
    id: nthOf(cells, 0),
    module: nthOf(cells, 1),
    justification: nthOf(cells, 4),
    kind: nthOf(cells, 5),
    status: nthOf(cells, 6),
    owner: nthOf(cells, 7),
    recordedWhere: nthOf(cells, 8),
  };
}

const ledgerRows: LedgerRow[] = allTableRows(ledger).filter(isLedgerRow).map(toLedgerRow);
const ledgerIds: string[] = ledgerRows.map(row => row.id);

function countBy(values: string[], token: string): number {
  return values.filter(value => value === token).length;
}

// Scoped to `## Roll-up`: the "How to read this file" section defines the same
// tokens in two-column tables whose second cell is prose, not a count.
function rollUpSection(): string {
  const body: string = ledger.slice(ledger.indexOf('\n## Roll-up\n') + 1);
  const end: number = body.indexOf('\n## ');
  return end < 0 ? body : body.slice(0, end);
}

const rollUpRows: string[][] = allTableRows(rollUpSection());

/** `| \`ratified\` | 24 |` — the declared count in a roll-up table. */
function rollUpCount(token: string): number {
  const row: string[] | undefined = rollUpRows.find(
    cells => cells.length === 2 && cells[0] === `\`${token}\``
  );
  return Number(row?.[1]);
}

function totalRollUps(): number[] {
  return rollUpRows
    .filter(cells => cells.length === 2 && cells[0] === ROLL_UP_TOTAL_LABEL)
    .map(cells => Number(nthOf(cells, 1).replace(/\*/g, '')));
}

// The ratification register carries rulings that have no ledger row of their own
// ("none (appendix ruling)") and ranges ("DEV-44 - DEV-50"), so every id it names
// is resolved individually rather than the cell being matched as a whole.
function ratificationSection(): string {
  return ledger.slice(ledger.indexOf('## Ratification register'));
}

function ratificationIds(): string[] {
  return [...ratificationSection().matchAll(/DEV-\d+/g)].map(match => match[0]);
}

// ---------------------------------------------------------------------------
// Code-level deviations — bidirectional tagging
// ---------------------------------------------------------------------------

const DEVIATION_SITE: RegExp = /1\.4\.11|2\.5\.8|deliberate.*deviation|documented exception/;

interface AllowedSite {
  file: string;
  phrase: string;
}

// Sites the pattern reaches that record CONFORMANCE or an intra-toolkit API
// choice, not a divergence from a canonical source, so no ledger row is owed.
// Matched by file plus an exact phrase — never by line number, which drifts.
// Adding an entry here is a ruling: a genuinely new deviation is closed by
// writing a ledger row and tagging the line `DEV-nn`, never by extending this list.
const ALLOWED_UNTAGGED_SITES: AllowedSite[] = [
  {
    file: 'src/components/ui-calendar-multi-select/style-tokens.ts',
    phrase: 'WCAG 2.5.8 target-size floor',
  },
  {
    file: 'src/components/ui-calendar-multi-select/types.ts',
    phrase: 'documented exception: `variant` is N/A',
  },
  {
    file: 'src/components/ui-pagination/types.ts',
    phrase: 'documented exceptions:',
  },
  {
    file: 'src/components/ui-notification-badge/types.ts',
    phrase: 'SC 2.5.8 passes with margin',
  },
  { file: 'src/components/ui-filter-chip/types.ts', phrase: '24px, SC 2.5.8' },
  {
    file: 'src/components/ui-status-badge/index.tsx',
    phrase: '24px, SC 2.5.8',
  },
  {
    file: 'src/components/ui-profile-select-card/styles.ts',
    phrase: '(SC 2.5.8, §10.2)',
  },
  {
    file: 'src/components/ui-payment-option-card/index.tsx',
    phrase: 'deliberate deviation from `UiIntegrationCard`',
  },
  {
    file: 'src/components/ui-payment-option-card/types.ts',
    phrase: 'deliberate deviation from `UiIntegrationCard`',
  },
  {
    file: 'src/components/ui-payment-option-card/payment-card-content.tsx',
    phrase: 'deliberate deviation from `UiIntegrationCard`',
  },
  // Records why the muted row keeps the website's one dark chevron asset: recolouring
  // it to brand-gray would resolve to 1.14:1 against the muted tint. That is a
  // conformance argument for following the upstream asset, not a divergence from it.
  {
    file: 'src/components/ui-item-row/recipe.ts',
    phrase: 'WCAG 1.4.11 wants 3:1 for a meaningful glyph',
  },
];

interface DeviationSite {
  file: string;
  line: string;
}

function sourceFiles(): string[] {
  const names: string[] = readdirSync(join(REPO_ROOT, 'src'), {
    recursive: true,
  }) as string[];
  return names.filter(name => /\.tsx?$/.test(name)).map(name => `src/${name}`);
}

function sitesInFile(file: string): DeviationSite[] {
  return readRepoFile(file)
    .split('\n')
    .filter(line => DEVIATION_SITE.test(line))
    .map(line => ({ file, line: line.trim() }));
}

const deviationSites: DeviationSite[] = sourceFiles().flatMap(sitesInFile);

function isAllowedSite(site: DeviationSite): boolean {
  return ALLOWED_UNTAGGED_SITES.some(
    allowed => allowed.file === site.file && site.line.includes(allowed.phrase)
  );
}

const untaggedSites: DeviationSite[] = deviationSites.filter(
  site => !/DEV-\d+/.test(site.line) && !isAllowedSite(site)
);

function taggedIdsInSource(): string[] {
  const ids: string[] = deviationSites.flatMap(site =>
    [...site.line.matchAll(/DEV-\d+/g)].map(match => match[0])
  );
  return [...new Set(ids)];
}

// ---------------------------------------------------------------------------
// DoD compliance matrix — the Story 5.2 implementation artifact
// ---------------------------------------------------------------------------

/** Body of `### Matrix`, up to the next `###` heading. */
function matrixSection(): string {
  const start: number = dodArtifact.indexOf('\n### Matrix\n');
  const body: string = dodArtifact.slice(start + 1);
  const end: number = body.indexOf('\n### ');
  return end < 0 ? body : body.slice(0, end);
}

function isMatrixRow(cells: string[]): boolean {
  return (
    cells.length === MATRIX_COLUMN_COUNT &&
    cells[7] !== 'Verdict' &&
    !SEPARATOR_CELL.test(nthOf(cells, 7))
  );
}

const matrixRows: string[][] = allTableRows(matrixSection()).filter(isMatrixRow);

/** The `.md` artifact a matrix row is keyed to; the parity-layer row names none. */
function matrixArtifact(cells: string[]): string | undefined {
  return backticked(nthOf(cells, 0)).find(token => token.endsWith('.md'));
}

const matrixArtifacts: string[] = matrixRows
  .map(matrixArtifact)
  .filter((name): name is string => name !== undefined);

// Every implementation artifact owes a row except the shared template, the
// status file (not an artifact) and this story's own artifact, which carries
// the matrix rather than appearing in it.
const MATRIX_EXCLUDED_FILES: string[] = ['story-dod-template.md', DOD_ARTIFACT_NAME];

function storyArtifacts(): string[] {
  return readdirSync(join(REPO_ROOT, IMPLEMENTATION_DIR))
    .filter(name => name.endsWith('.md'))
    .filter(name => !MATRIX_EXCLUDED_FILES.includes(name));
}

function isVerdictCell(cell: string): boolean {
  return VERDICT_TOKENS.some(token => cell.startsWith(`\`${token}\``));
}

function matrixRollUpClaim(token: string): number {
  const claim: RegExpMatchArray | null = dodArtifact.match(new RegExp(`(\\d+) rows? \`${token}\``));
  return Number(claim?.[1]);
}

function matrixVerdictCount(token: string): number {
  return countBy(
    matrixRows.map(cells => nthOf(cells, 7)),
    `\`${token}\``
  );
}

// ---------------------------------------------------------------------------
// Link shape and sprint-status invariants
// ---------------------------------------------------------------------------

const CANONICAL_REPO: string = 'VilnaCRM-Org/ui-toolkit';
const GITHUB_URL: RegExp = /github\.com\/([^\s)\]`"'>]+)/g;

function specMarkdownFiles(dir: string): string[] {
  return readdirSync(join(REPO_ROOT, dir))
    .filter(name => name.endsWith('.md'))
    .map(name => `${dir}/${name}`);
}

const specFiles: string[] = [PLANNING_DIR, IMPLEMENTATION_DIR].flatMap(specMarkdownFiles);

function foreignGithubRefs(relativePath: string): string[] {
  return [...readRepoFile(relativePath).matchAll(GITHUB_URL)]
    .map(match => nthOf(match, 1))
    .filter(ref => !ref.startsWith(CANONICAL_REPO));
}

interface SprintEntry {
  key: string;
  status: string;
}

function sprintEntries(): SprintEntry[] {
  const text: string = readRepoFile(SPRINT_STATUS_RELATIVE_PATH);
  return [...text.matchAll(/^ {2}([a-z0-9-]+): *([a-z-]+)$/gm)].map(match => ({
    key: nthOf(match, 1),
    status: nthOf(match, 2),
  }));
}

// Epic and retrospective keys name no artifact, and a `backlog` story has no file
// by definition — the artifact appears when the story is created. Everything else
// is the DOD-11 1:1 invariant recorded in the status file's own header.
function ownsArtifact(entry: SprintEntry): boolean {
  const isStory: boolean = !/^epic-/.test(entry.key) && !/-retrospective$/.test(entry.key);
  return isStory && entry.status !== 'backlog';
}

const trackedStoryKeys: string[] = sprintEntries()
  .filter(ownsArtifact)
  .map(entry => entry.key);

describe('component provenance traceability', () => {
  describe('the three governed artifacts parse', () => {
    it('reads registry, ledger and DoD matrix rows', () => {
      expect(registryRows.length).toBeGreaterThan(0);
      expect(ledgerRows.length).toBeGreaterThan(0);
      expect(matrixRows.length).toBeGreaterThan(0);
    });

    it('names its own path in every artifact that claims to be machine-checked', () => {
      const guard: string = 'tests/unit/component-provenance-traceability.test.ts';
      expect(registry).toContain(guard);
      expect(ledger).toContain(guard);
      expect(dodArtifact).toContain(guard);
    });
  });

  // A — coverage contract: the barrel and the registry are the same set.
  describe('A — registry coverage', () => {
    it.each(runtimeExports)('%s is recorded by a registry row', name => {
      expect(registryNames).toContain(name);
    });

    it.each(runtimeExports)('%s is recorded exactly once', name => {
      expect(countBy(registryNames, name)).toBe(1);
    });

    it.each(exportedRegistryNames)('%s resolves to a runtime export of src/components', name => {
      expect(runtimeExports).toContain(name);
    });

    it.each(registryRows.filter(row => row.internal))(
      '$name is flagged internal because the barrel does not export it',
      (row: RegistryRow) => {
        expect(runtimeExports).not.toContain(row.name);
      }
    );

    it.each(componentDirEntries())(
      'src/components/%s has a registry row or a Scope exclusion',
      entry => {
        expect(isTrackedModule(entry)).toBe(true);
      }
    );
  });

  // B — closed source vocabulary.
  describe('B — source labels', () => {
    it.each(registryRows)('$name carries a closed source token', (row: RegistryRow) => {
      expect(SOURCE_TOKENS).toContain(row.source);
    });
  });

  // C — every citation resolves on disk.
  describe('C — cited paths exist', () => {
    it.each(registryRows)('$name cites only paths that exist', (row: RegistryRow) => {
      expect(missingPaths(row.rationale)).toEqual([]);
      expect(missingPaths(row.alignment)).toEqual([]);
    });

    it.each(registryRows)('$name keys to a module path that exists', (row: RegistryRow) => {
      expect(existsSync(join(REPO_ROOT, row.modulePath))).toBe(true);
    });

    it('every test path the registry cites exists', () => {
      expect(missingPaths(registry).filter(path => path.startsWith('tests/'))).toEqual([]);
    });
  });

  // D — a row without evidence is not a record.
  describe('D — evidence is present and closed', () => {
    it.each(registryRows)('$name carries a rationale', (row: RegistryRow) => {
      expect(row.rationale.length).toBeGreaterThanOrEqual(MIN_EVIDENCE_LENGTH);
    });

    it.each(registryRows)('$name carries alignment notes', (row: RegistryRow) => {
      expect(row.alignment.length).toBeGreaterThanOrEqual(MIN_EVIDENCE_LENGTH);
    });

    it.each(registryRows)('$name ends with a closed Deviations clause', (row: RegistryRow) => {
      expect(hasClosedDeviationClause(row)).toBe(true);
    });
  });

  // E — the ledger's own integrity.
  describe('E — ledger integrity', () => {
    it('assigns every DEV id exactly once', () => {
      expect(ledgerIds.length).toBe(new Set(ledgerIds).size);
    });

    it.each(ledgerRows)('$id carries a closed Kind token', (row: LedgerRow) => {
      expect(KIND_TOKENS).toContain(row.kind);
    });

    it.each(ledgerRows)('$id carries a closed Status token', (row: LedgerRow) => {
      expect(STATUS_TOKENS).toContain(row.status);
    });

    it.each(ledgerRows)('$id carries an owner and a tracking ref', (row: LedgerRow) => {
      expect(row.owner).toMatch(/\S/);
      expect(row.owner).toMatch(/#\d+|unfiled:/);
    });

    it.each(ledgerRows)('$id carries a justification', (row: LedgerRow) => {
      expect(row.justification.length).toBeGreaterThanOrEqual(MIN_EVIDENCE_LENGTH);
    });

    it.each(KIND_TOKENS)('the roll-up count for kind %s matches the parsed rows', token => {
      expect(rollUpCount(token)).toBe(
        countBy(
          ledgerRows.map(row => row.kind),
          token
        )
      );
    });

    it.each(STATUS_TOKENS)('the roll-up count for status %s matches the parsed rows', token => {
      expect(rollUpCount(token)).toBe(
        countBy(
          ledgerRows.map(row => row.status),
          token
        )
      );
    });

    it('both roll-up totals match the parsed row count', () => {
      expect(totalRollUps()).toEqual([ledgerRows.length, ledgerRows.length]);
    });
  });

  // F — the registry, the ledger and the ratification register agree.
  describe('F — registry and ledger cross-links', () => {
    it.each(registryRows)('$name cites only ids the ledger defines', (row: RegistryRow) => {
      expect(citedDeviationIds(row).filter(id => !ledgerIds.includes(id))).toEqual([]);
    });

    it.each(ledgerRows)('$id records where the decision lives', (row: LedgerRow) => {
      expect(row.recordedWhere).toMatch(/\S/);
      expect(missingPaths(row.recordedWhere)).toEqual([]);
    });

    it('the ratification register names only ids the ledger defines', () => {
      expect(ratificationIds().filter(id => !ledgerIds.includes(id))).toEqual([]);
    });
  });

  // G — a code-level deviation cannot exist without a ledger row.
  describe('G — code-level deviations are ledgered', () => {
    it('finds the declared deviation sites under src/', () => {
      expect(deviationSites.length).toBeGreaterThan(0);
    });

    it('leaves no deviation site untagged and unruled', () => {
      expect(untaggedSites).toEqual([]);
    });

    it.each(taggedIdsInSource())('%s tagged in src/ resolves in the ledger', id => {
      expect(ledgerIds).toContain(id);
    });
  });

  // H — every delivery story is measured against the DoD template.
  describe('H — DoD compliance matrix', () => {
    it.each(storyArtifacts())('%s has a matrix row', name => {
      expect(matrixArtifacts).toContain(name);
    });

    it.each(matrixArtifacts)('%s named by a matrix row exists on disk', name => {
      expect(existsSync(join(REPO_ROOT, IMPLEMENTATION_DIR, name))).toBe(true);
    });

    it.each(matrixRows)('row %# carries a closed Verdict token', (...cells: string[]) => {
      expect(isVerdictCell(nthOf(cells, 7))).toBe(true);
    });

    it.each(matrixRows)('row %# carries a closed token in every section cell', (...cells) => {
      expect(MATRIX_SECTION_CELLS.filter(index => !isVerdictCell(nthOf(cells, index)))).toEqual([]);
    });

    it.each(VERDICT_TOKENS)('the roll-up claim for %s matches the parsed rows', token => {
      expect(matrixRollUpClaim(token)).toBe(matrixVerdictCount(token));
    });
  });

  // I — the DOD-06 typo class: a link that points at another repository.
  describe('I — repository link shape', () => {
    it.each(specFiles)('%s links only to the toolkit repository', relativePath => {
      expect(foreignGithubRefs(relativePath)).toEqual([]);
    });
  });

  // J — DOD-11: a tracked story key and its artifact filename are 1:1.
  describe('J — sprint-status keys map to artifacts', () => {
    it('tracks at least one story', () => {
      expect(trackedStoryKeys.length).toBeGreaterThan(0);
    });

    it.each(trackedStoryKeys)('%s has a matching artifact file', key => {
      expect(existsSync(join(REPO_ROOT, IMPLEMENTATION_DIR, `${key}.md`))).toBe(true);
    });
  });
});
