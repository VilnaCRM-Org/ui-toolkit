import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import * as publicComponents from '../../src/components';
import type {
  ActionIconName,
  AuthSkeletonProps,
  ButtonLinkTarget,
  CustomTextField,
  HeadingLevel,
  IntegrationLogo,
  ItemRowMethod,
  NeutralActionIconName,
  LayoutProps,
  ProfileSelectItem,
  SkeletonControlVariant,
  SkeletonImageVariant,
  SkeletonTextSize,
  SkeletonWidgetColumns,
  SkeletonWidgetSize,
  SkeletonWidgetVariant,
  StaticImageSrc,
  TaskAssignee,
  UiActionIconBarAction,
  UiActionIconBarProps,
  UiBackToMainProps,
  UiButtonProps,
  UiCalendarMultiSelectProps,
  UiCardItemData,
  UiCardListProps,
  UiCheckboxProps,
  UiContainerProps,
  UiFileUploadConstraints,
  UiFileUploadInputProps,
  UiFilterChipProps,
  UiFooterProps,
  UiFooterSocialLink,
  UiFormProps,
  UiImageProps,
  UiInputProps,
  UiIntegrationCardProps,
  UiItemRowProps,
  UiItemsListProps,
  UiLinkProps,
  UiMultiSelectOption,
  UiMultiSelectProps,
  UiNotificationBadgeProps,
  UiPaginationProps,
  UiPaymentOptionCardProps,
  UiPinCellLabel,
  UiPinInputProps,
  UiProfileSelectCardProps,
  UiRadioGroupProps,
  UiRadioOption,
  UiSearchInputProps,
  UiSelectWithSearchOption,
  UiSelectWithSearchProps,
  UiSkeletonBlockProps,
  UiSkeletonButtonProps,
  UiSkeletonControlTextProps,
  UiSkeletonImageProps,
  UiSkeletonInputProps,
  UiSkeletonListProps,
  UiSkeletonMenuProps,
  UiSkeletonTabBarProps,
  UiSkeletonTableProps,
  UiSkeletonTextProps,
  UiSkeletonWidgetProps,
  UiStatusBadgeProps,
  UiTaskCardProps,
  UiToolbarProps,
  UiTooltipProps,
  UiTypographyProps,
  UiUploadStatus,
} from '../../src/components';

// Story 5.3 (#33) — drift guard for the export contract
// (`specs/planning-artifacts/export-contract.md`, rules R1-R5).
//
// The register is the release-review evidence for `epics.md` Story 5.3, so it is
// machine-checked rather than reviewed by eye. Unlike `components-index.test.ts`,
// which compares the barrel against a hand-maintained list, this guard re-derives
// the module set from the filesystem: a new component that is neither exported
// nor recorded as an `internal` exception fails CI instead of passing silently.
//
// A failure here is closed by exporting the module, or by writing its `internal`
// row with a reason and a tracking ref — never by widening the token set or by
// dropping a directory from the sweep.

const REPO_ROOT: string = resolve(__dirname, '..', '..');
const REGISTER_PATH: string = join(REPO_ROOT, 'specs/planning-artifacts/export-contract.md');
const COMPONENTS_DIR: string = join(REPO_ROOT, 'src/components');
const BARREL_PATH: string = join(COMPONENTS_DIR, 'index.ts');
const ROOT_ENTRY_PATH: string = join(REPO_ROOT, 'src/index.ts');
const PACKAGE_PATH: string = join(REPO_ROOT, 'package.json');

const REGISTER_COLUMN_COUNT: number = 5;
const EMPTY_CELL: string = '—';
const STATUS_TOKENS: string[] = ['`exported`', '`internal`'];
const COMPONENT_ENTRY: string = 'index.tsx';
const MODULE_ENTRIES: string[] = [COMPONENT_ENTRY, 'index.ts'];

// R2 asks every exported component for a `*Props` type. These three exported
// modules publish no such name, each for a stated reason, so the register rather
// than the naming convention carries their contract.
const PROPS_EXEMPT: Record<string, string> = {
  'ui-breakpoints': 'breakpoint token module — exports theme values, takes no props',
  'ui-color-theme': 'colour token module — exports theme values, takes no props',
  'ui-text-field-form': 'publishes the generic `CustomTextField<T>` instead of a `Props` name',
};

// R3 — internal-only types: they appear in an internal child signature, never in
// a public props surface, so the barrel must not publish them.
const EXCLUDED_TYPES: string[] = [
  'CardContentProps',
  'ImageList',
  'CardItem',
  'CardType',
  'NonEmptyCardList',
  'CardList',
  'UiCardItemProps',
  'SocialMedia',
  'SkeletonTabsProps',
  'SkeletonTableColumn',
  'SkeletonTableColumnKind',
  'SkeletonTableColumnSlot',
  'SkeletonTextLine',
  'SkeletonWidgetCard',
  'SkeletonTaskRow',
  'SkeletonTaskColumn',
  'SkeletonTaskBar',
  'SkeletonChartBar',
];

const register: string = readFileSync(REGISTER_PATH, 'utf8');
const barrel: string = readFileSync(BARREL_PATH, 'utf8');
const rootEntry: string = readFileSync(ROOT_ENTRY_PATH, 'utf8');
const runtimeExports: string[] = Object.keys(publicComponents);

interface RegisterRow {
  module: string;
  values: string[];
  types: string[];
  status: string;
  reason: string;
}

/** Prettier pads cells and keeps the outer pipes, so both edges are stripped. */
function tableCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map(cell => cell.trim());
}

/** `` `A`, `B` `` → `['A', 'B']`; the em-dash placeholder → `[]`. */
function backtickedList(cell: string): string[] {
  return [...cell.matchAll(/`([^`]+)`/g)].map(match => match[1]);
}

function isRegisterRow(cells: string[]): boolean {
  return cells.length === REGISTER_COLUMN_COUNT && /^`[a-z0-9-]+`$/.test(cells[0]);
}

function toRegisterRow(cells: string[]): RegisterRow {
  return {
    module: backtickedList(cells[0])[0],
    values: backtickedList(cells[1]),
    types: backtickedList(cells[2]),
    status: cells[3],
    reason: cells[4],
  };
}

function registerRows(): RegisterRow[] {
  return register
    .split('\n')
    .filter(line => line.trimStart().startsWith('|'))
    .map(tableCells)
    .filter(isRegisterRow)
    .map(toRegisterRow);
}

function hasEntryPoint(name: string): boolean {
  return MODULE_ENTRIES.some(entry => existsSync(join(COMPONENTS_DIR, name, entry)));
}

/** Every directory under `src/components/` that owns an entry point. */
function moduleDirectories(): string[] {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(hasEntryPoint)
    .sort();
}

/** `export type { A, B } from './mod/types';` → `{ mod: ['A', 'B'] }`. */
function barrelTypeExports(): Map<string, string[]> {
  const found: Map<string, string[]> = new Map();
  const statements: RegExpMatchArray[] = [
    ...barrel.matchAll(/export\s+type\s*\{([^}]*)\}\s*from\s*'\.\/([^']+)'/g),
  ];
  statements.forEach(([, names, path]) => {
    const module: string = path.split('/')[0];
    const parsed: string[] = names
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);
    found.set(module, [...(found.get(module) ?? []), ...parsed]);
  });
  return found;
}

const rows: RegisterRow[] = registerRows();
const directories: string[] = moduleDirectories();
const typeExports: Map<string, string[]> = barrelTypeExports();
const exportedRows: RegisterRow[] = rows.filter(row => row.status === '`exported`');
const internalRows: RegisterRow[] = rows.filter(row => row.status === '`internal`');

// Compile-time binding of the barrel's type surface: every name below is
// imported from `src/components` above, so dropping an `export type` from the
// barrel breaks the type-check instead of passing the runtime key sweep.
type Named<T> = T;
type PublicTypeSurface = [
  Named<ActionIconName>,
  Named<AuthSkeletonProps>,
  Named<ButtonLinkTarget>,
  Named<CustomTextField<{ field: string }>>,
  Named<HeadingLevel>,
  Named<IntegrationLogo>,
  Named<ItemRowMethod>,
  Named<NeutralActionIconName>,
  Named<LayoutProps>,
  Named<ProfileSelectItem>,
  Named<SkeletonControlVariant>,
  Named<SkeletonImageVariant>,
  Named<SkeletonTextSize>,
  Named<SkeletonWidgetColumns>,
  Named<SkeletonWidgetSize>,
  Named<SkeletonWidgetVariant>,
  Named<StaticImageSrc>,
  Named<TaskAssignee>,
  Named<UiActionIconBarAction>,
  Named<UiActionIconBarProps>,
  Named<UiBackToMainProps>,
  Named<UiButtonProps>,
  Named<UiCalendarMultiSelectProps>,
  Named<UiCardItemData>,
  Named<UiCardListProps>,
  Named<UiCheckboxProps>,
  Named<UiContainerProps>,
  Named<UiFileUploadConstraints>,
  Named<UiFileUploadInputProps>,
  Named<UiFilterChipProps>,
  Named<UiFooterProps>,
  Named<UiFooterSocialLink>,
  Named<UiFormProps<{ field: string }>>,
  Named<UiImageProps>,
  Named<UiInputProps>,
  Named<UiIntegrationCardProps>,
  Named<UiItemRowProps>,
  Named<UiItemsListProps>,
  Named<UiLinkProps>,
  Named<UiMultiSelectOption>,
  Named<UiMultiSelectProps>,
  Named<UiNotificationBadgeProps>,
  Named<UiPaginationProps>,
  Named<UiPaymentOptionCardProps>,
  Named<UiPinCellLabel>,
  Named<UiPinInputProps>,
  Named<UiProfileSelectCardProps>,
  Named<UiRadioGroupProps>,
  Named<UiRadioOption>,
  Named<UiSearchInputProps>,
  Named<UiSelectWithSearchOption>,
  Named<UiSelectWithSearchProps>,
  Named<UiSkeletonBlockProps>,
  Named<UiSkeletonButtonProps>,
  Named<UiSkeletonControlTextProps>,
  Named<UiSkeletonImageProps>,
  Named<UiSkeletonInputProps>,
  Named<UiSkeletonListProps>,
  Named<UiSkeletonMenuProps>,
  Named<UiSkeletonTabBarProps>,
  Named<UiSkeletonTableProps>,
  Named<UiSkeletonTextProps>,
  Named<UiSkeletonWidgetProps>,
  Named<UiStatusBadgeProps>,
  Named<UiTaskCardProps>,
  Named<UiToolbarProps>,
  Named<UiTooltipProps>,
  Named<UiTypographyProps>,
  Named<UiUploadStatus>,
];
const BOUND_TYPE_COUNT: PublicTypeSurface['length'] = 69;

describe('export contract integrity (Story 5.3, #33)', () => {
  describe('A — the register covers the module tree (R1, R4)', () => {
    it('records exactly one row per module directory', () => {
      expect(rows.map(row => row.module).sort()).toEqual(directories);
    });

    it('names no module that does not exist', () => {
      const unknown: string[] = rows.map(row => row.module).filter(name => !hasEntryPoint(name));
      expect(unknown).toEqual([]);
    });

    it('uses only the closed status token set', () => {
      const illegal: string[] = rows.map(row => row.status).filter(s => !STATUS_TOKENS.includes(s));
      expect(illegal).toEqual([]);
    });
  });

  describe('B — exception rows are traceable (R4)', () => {
    it('gives every internal module a non-empty reason', () => {
      const missing: string[] = internalRows
        .filter(row => row.reason === EMPTY_CELL || row.reason.length === 0)
        .map(row => row.module);
      expect(missing).toEqual([]);
    });

    it('cites a story or a deviation id in every internal reason', () => {
      const untracked: string[] = internalRows
        .filter(row => !/(Story \d+\.\d+|DEV-\d+|#\d+)/.test(row.reason))
        .map(row => row.module);
      expect(untracked).toEqual([]);
    });

    it('publishes nothing for an internal module', () => {
      const leaking: string[] = internalRows
        .filter(row => row.values.length > 0 || row.types.length > 0)
        .map(row => row.module);
      expect(leaking).toEqual([]);
    });

    it('keeps the reason column empty for an exported module', () => {
      const noisy: string[] = exportedRows
        .filter(row => row.reason !== EMPTY_CELL)
        .map(row => row.module);
      expect(noisy).toEqual([]);
    });
  });

  describe('C — the register and the barrel agree on values (R1)', () => {
    it('matches the barrel runtime surface exactly', () => {
      const declared: string[] = exportedRows.flatMap(row => row.values).sort();
      expect(declared).toEqual([...runtimeExports].sort());
    });

    it('declares at least one value export per exported module', () => {
      const empty: string[] = exportedRows.filter(r => r.values.length === 0).map(r => r.module);
      expect(empty).toEqual([]);
    });

    it('exports no module the register marks internal', () => {
      const names: string[] = internalRows.flatMap(row => typeExports.get(row.module) ?? []);
      expect(names).toEqual([]);
    });
  });

  describe('D — the register and the barrel agree on types (R2, R3)', () => {
    it('re-exports every type the register claims, from its own module', () => {
      const missing: string[] = exportedRows.flatMap(row =>
        row.types.filter(name => !(typeExports.get(row.module) ?? []).includes(name))
      );
      expect(missing).toEqual([]);
    });

    it('records every type the barrel re-exports', () => {
      const byModule: Map<string, string[]> = new Map(rows.map(row => [row.module, row.types]));
      const unrecorded: string[] = [...typeExports].flatMap(([module, names]) =>
        names.filter(name => !(byModule.get(module) ?? []).includes(name))
      );
      expect(unrecorded).toEqual([]);
    });

    it('publishes a props type for every exported component', () => {
      const bare: string[] = exportedRows
        .filter(row => existsSync(join(COMPONENTS_DIR, row.module, COMPONENT_ENTRY)))
        .filter(row => !(row.module in PROPS_EXEMPT))
        .filter(row => !row.types.some(name => name.endsWith('Props')))
        .map(row => row.module);
      expect(bare).toEqual([]);
    });

    it('states a reason for every exported module without a props type', () => {
      const undocumented: string[] = Object.keys(PROPS_EXEMPT).filter(
        module => !register.includes(module)
      );
      expect(undocumented).toEqual([]);
    });

    it('keeps the internal-only types off the public surface', () => {
      const published: string[] = [...typeExports.values()]
        .flat()
        .filter(name => EXCLUDED_TYPES.includes(name));
      expect(published).toEqual([]);
    });

    it('binds the whole public type surface at compile time', () => {
      const declared: number = exportedRows.flatMap(row => row.types).length;
      expect(BOUND_TYPE_COUNT).toBe(declared);
    });
  });

  describe('E — the package entry-point chain resolves (AC-1)', () => {
    const manifest: Record<string, unknown> = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));

    it('re-exports the component barrel from the package root module', () => {
      expect(rootEntry).toContain("export * from './components'");
    });

    it('points main, module and types at the built entry', () => {
      expect(manifest.main).toBe('./build/index.mjs');
      expect(manifest.module).toBe('./build/index.mjs');
      expect(manifest.types).toBe('./build/index.d.ts');
    });

    it('maps the root and stylesheet subpath exports to the same build output', () => {
      expect(manifest.exports).toEqual({
        '.': { types: './build/index.d.ts', import: './build/index.mjs' },
        './styles.css': './build/index.css',
      });
    });

    it('ships only the build directory', () => {
      expect(manifest.files).toEqual(['build']);
    });
  });
});
