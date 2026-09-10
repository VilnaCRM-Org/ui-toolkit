import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiActionIconBar from '../../src/components/ui-action-icon-bar';
import actionIconBarWarning from '../../src/components/ui-action-icon-bar/action-icon-bar-warnings';
import {
  DOTS_HORIZONTAL_PATHS,
  DOTS_VERTICAL_PATHS,
  EYE_OFF_PATH,
  EYE_PATHS,
  SETTINGS_PATH,
  TRASH_PATH,
  X_CLOSE_PATH,
} from '../../src/components/ui-action-icon-bar/icon-paths';
import {
  BACKDROP_CLASS,
  actionBackdropSx,
  actionButtonSx,
  actionIconBarSx,
  glyphLayerSx,
  hasBackdrop,
} from '../../src/components/ui-action-icon-bar/styles';
import type {
  ActionIconName,
  UiActionIconBarAction,
  UiActionIconBarProps,
} from '../../src/components/ui-action-icon-bar/types';
import {
  useActionIconBar,
  type ActionIconBarModel,
} from '../../src/components/ui-action-icon-bar/use-action-icon-bar';
import {
  isWiredAction,
  useActionState,
  type ActionState,
} from '../../src/components/ui-action-icon-bar/use-action-state';

import { ARIA_SELECTOR, expectNoLiveRegion, focusables, nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleError from './utils/mock-console-error';
import mockConsoleWarn from './utils/mock-console-warn';
import nthOf from './utils/nth-of';
import { keysMatching, type StyleObject } from './utils/style-layers';

// UiActionIconBar emits four dev-only accessibility warnings through console.warn.
// Silence them for the suite and keep a live handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

// React reports a broken list key — a missing one, or two siblings sharing one —
// through console.error and nowhere else. Silence that channel too, and keep the
// handle so the row's keying can be asserted instead of merely eyeballed.
const error: { readonly spy: jest.SpyInstance } = mockConsoleError();

const noop: () => void = () => undefined;

// Icon-only buttons have no visible text, so each of these strings is the whole
// accessible name of its action (a11y contract S7). The eye's label is CONSTANT
// across both toggle states — `aria-pressed` already carries the state.
const CLOSE: string = 'Закрити';
const MORE: string = 'Більше дій';
const ROW_MENU: string = 'Меню рядка';
const VISIBILITY: string = 'Видимість';
const SETTINGS: string = 'Налаштування';
const DELETE: string = 'Видалити';
const BAR_LABEL: string = 'Дії над рядком';

const ROW_LABELS: readonly string[] = [CLOSE, MORE, ROW_MENU, VISIBILITY, SETTINGS, DELETE];

// The Figma row order (Board A, y = 1412-1422), fully wired: five plain commands
// plus the one toggle.
const WIRED_ROW: readonly UiActionIconBarAction[] = [
  { icon: 'x-close', label: CLOSE, onActivate: noop },
  { icon: 'dots-horizontal', label: MORE, onActivate: noop },
  { icon: 'dots-vertical', label: ROW_MENU, onActivate: noop },
  { icon: 'eye', label: VISIBILITY, onToggle: noop },
  { icon: 'settings', label: SETTINGS, onActivate: noop },
  { icon: 'trash', label: DELETE, onActivate: noop },
];

// The same six slots with every callback withheld — the static branch (S2).
const STATIC_ROW: readonly UiActionIconBarAction[] = [
  { icon: 'x-close', label: CLOSE },
  { icon: 'dots-horizontal', label: MORE },
  { icon: 'dots-vertical', label: ROW_MENU },
  { icon: 'eye', label: VISIBILITY },
  { icon: 'settings', label: SETTINGS },
  { icon: 'trash', label: DELETE },
];

const FOCUS_RING: string = 'inset 0 0 0 2px #1A1C1E';
const FOCUS_SELECTORS: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';
const HOVER_SELECTOR: string = '&:hover:not([aria-disabled="true"])';
const ACTIVE_SELECTOR: string = '&:active:not([aria-disabled="true"])';
const DISABLED_SELECTOR: string = '&[aria-disabled="true"]';
const BACKDROP_SELECTOR: string = `& .${BACKDROP_CLASS}`;
const DANGER_TINT: string = 'rgba(220, 57, 57, 0.1)';

const GREY_300: string = '#969B9D';
const GREY_400: string = '#D0D4D8';
const GREY_200: string = '#404142';
const PRIMARY: string = '#1EAEFF';
const BTN_ACTIVE: string = '#0399ED';
const ERROR: string = '#DC3939';
const STROKE_DANGER: string = '#DF7878';

interface BarOverrides {
  label?: string | undefined;
  actions?: readonly UiActionIconBarAction[] | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  sx?: UiActionIconBarProps['sx'] | undefined;
}

// Props are threaded one by one (the repo forbids JSX spreading). `in` checks keep
// the "runtime data violates the prop type" fixtures — an absent label, a nullish
// actions array — expressible as an explicit `undefined`.
function barWith(extra: Readonly<BarOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : BAR_LABEL) as string;
  const actions: readonly UiActionIconBarAction[] = (
    'actions' in extra ? extra.actions : WIRED_ROW
  ) as readonly UiActionIconBarAction[];
  return (
    <UiActionIconBar
      label={label}
      actions={actions}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

function bar(): HTMLElement {
  return screen.getByRole('group');
}

function buttons(): HTMLElement[] {
  return screen.getAllByRole('button');
}

function svgs(): Element[] {
  return nodesMatching('svg');
}

function pathNodesIn(node: Element): Element[] {
  return Array.from(node.querySelectorAll('path'));
}

function pathsIn(node: Element): string[] {
  return pathNodesIn(node).map((path: Element): string => path.getAttribute('d') ?? '');
}

// The glyph belonging to the nth slot, in DOM (= paint = tab) order.
function glyphAt(index: number): Element {
  return nthOf(svgs(), index);
}

function ariaNodes(): Element[] {
  return nodesMatching(ARIA_SELECTOR);
}

function slotOf(icon: ActionIconName, interactive: boolean): StyleObject {
  return actionButtonSx({ icon, interactive }) as StyleObject;
}

function barLayers(sx: UiActionIconBarProps['sx']): StyleObject[] {
  return actionIconBarSx({ sx }) as StyleObject[];
}

function ruleAt(base: StyleObject, selector: string): StyleObject {
  return base[selector] as StyleObject;
}

// The seven Figma `d` strings, re-wrapped at different whitespace to the source's
// own fragments so these really are independent pins, not a copy of the
// expression that produces them. SVG treats runs of whitespace as separators, so
// joining with a single space reproduces the original path exactly.
const EXPECTED_X_CLOSE: string = 'M18 6L6 18M6 6L18 18';

const EXPECTED_DOTS_HORIZONTAL: readonly string[] = [
  [
    'M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11',
    '11.44772 11 12C11 12.55228 11.44772 13 12 13Z',
  ].join(' '),
  [
    'M19 13C19.5523 13 20 12.55228 20 12C20 11.44772 19.5523 11 19 11C18.4477 11 18 11.44772',
    '18 12C18 12.55228 18.4477 13 19 13Z',
  ].join(' '),
  [
    'M5 13C5.55228 13 6 12.55228 6 12C6 11.44772 5.55228 11 5 11C4.44772 11 4 11.44772 4 12C4',
    '12.55228 4.44772 13 5 13Z',
  ].join(' '),
];

const EXPECTED_DOTS_VERTICAL: readonly string[] = [
  [
    'M12 13C12.55228 13 13 12.55228 13 12C13 11.44772 12.55228 11 12 11C11.44772 11 11',
    '11.44772 11 12C11 12.55228 11.44772 13 12 13Z',
  ].join(' '),
  [
    'M12 6C12.55228 6 13 5.55228 13 5C13 4.44772 12.55228 4 12 4C11.44772 4 11 4.44772 11',
    '5C11 5.55228 11.44772 6 12 6Z',
  ].join(' '),
  [
    'M12 20C12.55228 20 13 19.5523 13 19C13 18.4477 12.55228 18 12 18C11.44772 18 11 18.4477',
    '11 19C11 19.5523 11.44772 20 12 20Z',
  ].join(' '),
];

const EXPECTED_EYE: readonly string[] = [
  [
    'M2.42012 12.71318C2.28394 12.49754 2.21584 12.38972 2.17772 12.22342C2.14909 12.0985',
    '2.14909 11.9015 2.17772 11.77658C2.21584 11.61028 2.28394 11.50246 2.42012',
    '11.28682C3.54553 9.50484 6.8954 5 12 5C17.10545 5 20.45525 9.50484 21.58065',
    '11.28682C21.71685 11.50246 21.78495 11.61028 21.82305 11.77658C21.85175 11.9015 21.85175',
    '12.0985 21.82305 12.22342C21.78495 12.38972 21.71685 12.49754 21.58065 12.71318C20.45525',
    '14.4952 17.10545 19 12 19C6.8954 19 3.54553 14.4952 2.42012 12.71318Z',
  ].join(' '),
  [
    'M12 15C13.65725 15 15.00045 13.65685 15.00045 12C15.00045 10.34315 13.65725 9 12',
    '9C10.34355 9 9.0004 10.34315 9.0004 12C9.0004 13.65685 10.34355 15 12 15Z',
  ].join(' '),
];

const EXPECTED_EYE_OFF: string = [
  'M10.74294 5.09232C11.14936 5.03223 11.56865 5 12 5C17.10545 5 20.45525 9.50484 21.58065',
  '11.28682C21.71695 11.5025 21.78505 11.61034 21.82315 11.77667C21.85175 11.90159 21.85175',
  '12.0987 21.82305 12.2236C21.78495 12.3899 21.71635 12.4985 21.57915 12.7156C21.27935',
  '13.1901 20.82215 13.8571 20.21645 14.5805M6.72432 6.71504C4.56225 8.1817 3.09445',
  '10.21938 2.42111 11.28528C2.28428 11.50187 2.21587 11.61016 2.17774 11.77648C2.1491',
  '11.9014 2.14909 12.0984 2.17771 12.2234C2.21583 12.3897 2.28393 12.4975 2.42013',
  '12.7132C3.54554 14.4952 6.89541 19 12 19C14.05885 19 15.83185 18.2676 17.28885 17.2766M3',
  '3L21 21M9.8791 9.87868C9.3362 10.42157 9.00042 11.17157 9.00042 12C9.00042 13.6569',
  '10.34356 15 12 15C12.82885 15 13.57885 14.6642 14.12175 14.1213',
].join(' ');

const EXPECTED_SETTINGS: string = [
  'M3.75 10L18.75 10M18.75 10C18.75 12.07107 20.4289 13.75 22.5 13.75C24.5711 13.75 26.25',
  '12.07107 26.25 10C26.25 7.92893 24.5711 6.25 22.5 6.25C20.4289 6.25 18.75 7.92893 18.75',
  '10ZM11.25 20L26.25 20M11.25 20C11.25 22.0711 9.57107 23.75 7.5 23.75C5.42893 23.75 3.75',
  '22.0711 3.75 20C3.75 17.9289 5.42893 16.25 7.5 16.25C9.57107 16.25 11.25 17.9289 11.25',
  '20Z',
].join(' ');

const EXPECTED_TRASH: string = [
  'M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.7157 15.2843 2.40974 14.908',
  '2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.07989 2 9.51984 2 9.09202 2.21799C8.71569',
  '2.40974 8.40973 2.7157 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M3 6H21M19 6V17.2C19',
  '18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202',
  '22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146',
  '20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6',
].join(' ');

describe('UiActionIconBar — group semantics (Ruling 2: role="group", never toolbar)', () => {
  it('renders a div root with role="group" named by the bar label', () => {
    render(barWith({}));

    const root: HTMLElement = bar();
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('role', 'group');
    expect(root).toHaveAccessibleName(BAR_LABEL);
  });

  it('never ships role="toolbar", nor any composite state on the root', () => {
    render(barWith({}));

    const root: HTMLElement = bar();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(root).not.toHaveAttribute('tabindex');
    expect(root).not.toHaveAttribute('aria-orientation');
    expect(root).not.toHaveAttribute('aria-activedescendant');
    expect(root).not.toHaveAttribute('aria-disabled');
  });

  it('gives every action an independent tab stop, with no roving tabindex', () => {
    render(barWith({}));

    // A roving implementation would put `tabindex="0"` on one button and
    // `tabindex="-1"` on the rest. There is none: the buttons are natively
    // focusable and carry no tabindex at all.
    buttons().forEach((button: HTMLElement): void => {
      expect(button).not.toHaveAttribute('tabindex');
    });
    expect(focusables()).toHaveLength(6);
  });

  it('reaches all six actions with Tab, in DOM order', async () => {
    const user: UserEvent = userEvent.setup();
    render(barWith({}));

    const order: HTMLElement[] = buttons();
    for (const button of order) {
      await user.tab();
      expect(button).toHaveFocus();
    }
  });

  it('applies id to the root only when the consumer supplies one', () => {
    const { rerender } = render(barWith({}));
    expect(bar()).not.toHaveAttribute('id');

    rerender(barWith({ id: 'row-actions' }));
    expect(bar()).toHaveAttribute('id', 'row-actions');
  });

  it('renders nothing but the root for a nullish actions array', () => {
    render(barWith({ actions: undefined }));

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(svgs()).toHaveLength(0);
    expect(focusables()).toHaveLength(0);
  });

  it('exposes its display name', () => {
    expect(UiActionIconBar.displayName).toBe('UiActionIconBar');
  });

  it('forwards a ref to the wired root and to the static one alike', () => {
    const ref: React.RefObject<HTMLDivElement | null> = React.createRef<HTMLDivElement>();
    const { rerender } = render(
      <UiActionIconBar label={BAR_LABEL} actions={WIRED_ROW} ref={ref} />
    );
    expect(ref.current).toBe(bar());

    rerender(<UiActionIconBar label={BAR_LABEL} actions={STATIC_ROW} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).not.toHaveAttribute('role');
  });
});

describe('UiActionIconBar — action buttons and accessible names (S1/S7)', () => {
  it('renders every action as a native type="button" named by aria-label', () => {
    render(barWith({}));

    const row: HTMLElement[] = buttons();
    expect(row).toHaveLength(6);
    row.forEach((button: HTMLElement, index: number): void => {
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label', ROW_LABELS[index]);
      expect(button).toHaveAccessibleName(ROW_LABELS[index]);
    });
  });

  it('keeps the icon row free of visible text', () => {
    render(barWith({}));

    expect(bar()).toHaveTextContent('');
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
    expect(nodesMatching('input')).toHaveLength(0);
  });

  it('hides every glyph from the accessibility tree and the tab order', () => {
    render(barWith({}));

    const marks: Element[] = svgs();
    expect(marks).toHaveLength(6);
    marks.forEach((mark: Element): void => {
      expect(mark).toHaveAttribute('aria-hidden', 'true');
      expect(mark).toHaveAttribute('focusable', 'false');
      expect(mark).toHaveAttribute('fill', 'none');
      expect(mark).not.toHaveAttribute('role');
    });
  });

  it('applies a per-action id only when supplied', () => {
    render(
      barWith({
        actions: [
          { icon: 'x-close', label: CLOSE, onActivate: noop, id: 'close-row' },
          { icon: 'trash', label: DELETE, onActivate: noop },
        ],
      })
    );

    expect(nthOf(buttons(), 0)).toHaveAttribute('id', 'close-row');
    expect(nthOf(buttons(), 1)).not.toHaveAttribute('id');
  });

  it('renders each icon at its Figma size in its native viewBox and stroke weight', () => {
    render(barWith({}));

    svgs().forEach((mark: Element, index: number): void => {
      const edge: string = index === 4 ? '30' : '24';
      expect(mark).toHaveAttribute('width', edge);
      expect(mark).toHaveAttribute('height', edge);
    });
    // `settings-04` is the board's one larger glyph: Figma draws it 30x30
    // (451:26186, siblings 24x24), so it renders unscaled in its native 30-unit
    // space at its native 2.5 stroke.
    expect(glyphAt(4)).toHaveAttribute('viewBox', '0 0 30 30');
    expect(glyphAt(0)).toHaveAttribute('viewBox', '0 0 24 24');
    expect(pathNodesIn(glyphAt(4))[0]).toHaveAttribute('stroke-width', '2.5');
    expect(pathNodesIn(glyphAt(0))[0]).toHaveAttribute('stroke-width', '2');
  });

  it('strokes every path with currentColor and round caps, and fills none', () => {
    render(barWith({}));

    nodesMatching('path').forEach((path: Element): void => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
      expect(path).not.toHaveAttribute('fill');
    });
  });

  it('paints the multi-subpath glyphs as several paths in one svg', () => {
    render(barWith({}));

    // The dots menus are three stroked circles and the eye is a lid plus a pupil;
    // the single-path icons stay single.
    expect(pathsIn(glyphAt(0))).toEqual([EXPECTED_X_CLOSE]);
    expect(pathsIn(glyphAt(1))).toEqual(EXPECTED_DOTS_HORIZONTAL);
    expect(pathsIn(glyphAt(2))).toEqual(EXPECTED_DOTS_VERTICAL);
    expect(pathsIn(glyphAt(3))).toEqual(EXPECTED_EYE);
    expect(pathsIn(glyphAt(4))).toEqual([EXPECTED_SETTINGS]);
    expect(pathsIn(glyphAt(5))).toEqual([EXPECTED_TRASH]);
  });

  it('renders the danger backdrop layer for the trash lane alone', () => {
    render(barWith({}));

    const plates: Element[] = nodesMatching(`.${BACKDROP_CLASS}`);
    expect(plates).toHaveLength(1);
    expect(firstOf(plates).tagName).toBe('SPAN');
    expect(plates[0]).toHaveAttribute('aria-hidden', 'true');
    expect(nthOf(buttons(), 5)).toContainElement(plates[0] as HTMLElement);
  });
});

describe('UiActionIconBar — slot keys (list identity across re-renders)', () => {
  const KEYED_ROW: readonly UiActionIconBarAction[] = [
    { icon: 'x-close', label: CLOSE, onActivate: noop, id: 'close-row' },
    { icon: 'trash', label: DELETE, onActivate: noop, id: 'delete-row' },
  ];

  it('keys a slot by its own id, so a reordered row moves nodes instead of rebuilding', () => {
    const { rerender } = render(barWith({ actions: KEYED_ROW }));
    const deleteSlot: HTMLElement = nthOf(buttons(), 1);

    rerender(barWith({ actions: [nthOf(KEYED_ROW, 1), firstOf(KEYED_ROW)] }));

    // The id is what ties a slot to its action across a reorder. Keyed by
    // position instead, neither key would survive the swap: React would tear
    // both slots down and mount replacements, handing the same two actions new
    // buttons — and dropping the focus and the pointer state that sat on them.
    expect(nthOf(buttons(), 0)).toBe(deleteSlot);
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-label', DELETE);
  });

  it('falls back to icon+index, so an id-less row never shares one key', () => {
    render(barWith({ actions: WIRED_ROW }));

    // Six slots and not one id: the fallback has to differ per slot. A constant
    // one would collide six ways, and React reports every collision as
    // "Encountered two children with the same key" on console.error alone.
    expect(error.spy).not.toHaveBeenCalledWith(
      expect.stringContaining('Encountered two children with the same key'),
      expect.anything()
    );
  });
});

describe('UiActionIconBar — plain actions carry no state ARIA', () => {
  it('leaves toggle, popup and selection ARIA off every non-toggle action', () => {
    render(barWith({}));

    const plain: HTMLElement[] = [0, 1, 2, 4, 5].map((index: number) => nthOf(buttons(), index));
    plain.forEach((button: HTMLElement): void => {
      expect(button).not.toHaveAttribute('aria-pressed');
      expect(button).not.toHaveAttribute('aria-selected');
      expect(button).not.toHaveAttribute('aria-haspopup');
      expect(button).not.toHaveAttribute('aria-expanded');
      expect(button).not.toHaveAttribute('aria-controls');
    });
    // The bar has no selection axis at all, on any lane.
    expect(nodesMatching('[aria-checked]')).toHaveLength(0);
  });

  it('gives the danger action no aria-pressed — the red plate is a pointer state', () => {
    render(barWith({}));

    // Frame 5441 is the Figma `:active` column, not a toggle: painting
    // `aria-pressed` here would announce a state the control never holds.
    expect(nthOf(buttons(), 5)).not.toHaveAttribute('aria-pressed');
  });

  it('fires onActivate exactly once per click and per key activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(barWith({ actions: [{ icon: 'x-close', label: CLOSE, onActivate }] }));

    await user.click(nthOf(buttons(), 0));
    expect(onActivate).toHaveBeenCalledTimes(1);

    nthOf(buttons(), 0).focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);

    // Space must not double-fire: there are no manual key handlers (S6).
    await user.keyboard(' ');
    expect(onActivate).toHaveBeenCalledTimes(3);
  });
});

describe('UiActionIconBar — eye visibility toggle (binding pressed semantics)', () => {
  function eyeRow(pressed: boolean | undefined, onToggle: () => void): UiActionIconBarAction[] {
    return [{ icon: 'eye', label: VISIBILITY, pressed, onToggle }];
  }

  it('renders aria-pressed in BOTH states, coerced from nullish', () => {
    const { rerender } = render(barWith({ actions: eyeRow(undefined, noop) }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'false');

    rerender(barWith({ actions: eyeRow(true, noop) }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'true');

    rerender(barWith({ actions: eyeRow(false, noop) }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps the accessible name CONSTANT across both states', () => {
    const { rerender } = render(barWith({ actions: eyeRow(false, noop) }));
    expect(nthOf(buttons(), 0)).toHaveAccessibleName(VISIBILITY);

    rerender(barWith({ actions: eyeRow(true, noop) }));
    expect(nthOf(buttons(), 0)).toHaveAccessibleName(VISIBILITY);
  });

  it('swaps eye→eye-off off `pressed` alone, both glyphs staying aria-hidden', () => {
    const { rerender } = render(barWith({ actions: eyeRow(false, noop) }));
    expect(pathsIn(glyphAt(0))).toEqual(EXPECTED_EYE);

    rerender(barWith({ actions: eyeRow(true, noop) }));
    expect(pathsIn(glyphAt(0))).toEqual([EXPECTED_EYE_OFF]);
    expect(glyphAt(0)).toHaveAttribute('aria-hidden', 'true');
    expect(glyphAt(0)).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('never lends eye-off to another lane, however pressed that lane is', () => {
    render(
      barWith({
        actions: [
          { icon: 'settings', label: SETTINGS, pressed: true, onToggle: noop },
          { icon: 'x-close', label: CLOSE, pressed: true, onToggle: noop },
        ],
      })
    );

    // Both slots are real toggles holding a real pressed state, so `pressed`
    // alone cannot decide the swap: the eye-off vector belongs to the eye lane
    // and to nothing else, and a settings toggle keeps its native 30-unit box.
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'true');
    expect(pathsIn(glyphAt(0))).toEqual([EXPECTED_SETTINGS]);
    expect(glyphAt(0)).toHaveAttribute('viewBox', '0 0 30 30');
    expect(nthOf(buttons(), 1)).toHaveAttribute('aria-pressed', 'true');
    expect(pathsIn(glyphAt(1))).toEqual([EXPECTED_X_CLOSE]);
  });

  it('keeps rendering the current glyph while disabled', () => {
    render(
      barWith({
        actions: [
          { icon: 'eye', label: VISIBILITY, pressed: true, onToggle: noop, disabled: true },
        ],
      })
    );

    // Figma's disabled column draws eye-off, but that is a board copy-paste
    // artefact: a disabled toggle shows whichever state it is actually in.
    expect(pathsIn(glyphAt(0))).toEqual([EXPECTED_EYE_OFF]);
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle exactly once per click, Enter and Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(barWith({ actions: eyeRow(false, onToggle) }));

    await user.click(nthOf(buttons(), 0));
    expect(onToggle).toHaveBeenCalledTimes(1);

    nthOf(buttons(), 0).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  it('never self-flips: aria-pressed stays put until the consumer feeds it back', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(barWith({ actions: eyeRow(false, onToggle) }));

    await user.click(nthOf(buttons(), 0));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-pressed', 'false');
  });

  it('gives the toggle ONE activation path, onToggle winning over onActivate', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(barWith({ actions: [{ icon: 'eye', label: VISIBILITY, onToggle, onActivate }] }));

    await user.click(nthOf(buttons(), 0));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('ignores `pressed` on an action with no onToggle, rendering no aria-pressed', () => {
    render(
      barWith({ actions: [{ icon: 'eye', label: VISIBILITY, pressed: true, onActivate: noop }] })
    );

    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-pressed');
    // The glyph does not swap either: an unbacked pressed rendering would paint a
    // state nothing exposes.
    expect(pathsIn(glyphAt(0))).toEqual(EXPECTED_EYE);
  });
});

describe('UiActionIconBar — popup passthrough (the 3.3 dangling-idref rule)', () => {
  function menuAction(menuOpen: boolean | undefined, menuId?: string): UiActionIconBarAction {
    return {
      icon: 'dots-horizontal',
      label: MORE,
      hasPopup: 'menu',
      menuOpen,
      menuId,
      onActivate: noop,
    };
  }

  it('renders aria-haspopup only where the consumer asked for it', () => {
    render(
      barWith({
        actions: [menuAction(false), { icon: 'x-close', label: CLOSE, onActivate: noop }],
      })
    );

    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-haspopup', 'menu');
    expect(nthOf(buttons(), 1)).not.toHaveAttribute('aria-haspopup');
  });

  it('renders aria-expanded in BOTH states, and omits it when unwired', () => {
    const { rerender } = render(barWith({ actions: [menuAction(false)] }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-expanded', 'false');

    rerender(barWith({ actions: [menuAction(true)] }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-expanded', 'true');

    rerender(barWith({ actions: [menuAction(undefined)] }));
    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-expanded');
  });

  it('omits aria-controls for a blank menuId rather than emitting an empty list', () => {
    // `aria-controls` is an IDREF LIST, so `aria-controls=""` is a zero-length
    // list — invalid ARIA rather than a dangling reference.
    render(barWith({ actions: [menuAction(true, '   ')] }));

    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-controls');
    // The rest of the menu-button channel is unaffected.
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-haspopup', 'menu');
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders aria-controls only while the menu is really open', () => {
    const { rerender } = render(barWith({ actions: [menuAction(true, 'row-menu')] }));
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-controls', 'row-menu');

    rerender(barWith({ actions: [menuAction(false, 'row-menu')] }));
    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-controls');

    rerender(barWith({ actions: [menuAction(undefined, 'row-menu')] }));
    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-controls');
  });

  it('renders no aria-controls when the menu is open but unidentified', () => {
    render(barWith({ actions: [menuAction(true)] }));

    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-expanded', 'true');
    expect(nthOf(buttons(), 0)).not.toHaveAttribute('aria-controls');
  });
});

describe('UiActionIconBar — disabled matrix (S4 aria-disabled boundary)', () => {
  it('marks a per-action disabled button aria-disabled without native disabled', () => {
    render(
      barWith({
        actions: [
          { icon: 'x-close', label: CLOSE, onActivate: noop, disabled: true },
          { icon: 'trash', label: DELETE, onActivate: noop },
        ],
      })
    );

    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-disabled', 'true');
    // Native `disabled` is NEVER set, which is what keeps a disabled action
    // focusable and stops focus being dropped mid-interaction (SC 2.4.3).
    expect(nthOf(buttons(), 0)).toBeEnabled();
    expect(nodesMatching('button[disabled]')).toHaveLength(0);
    expect(nthOf(buttons(), 1)).not.toHaveAttribute('aria-disabled');
  });

  it('ORs the whole-bar flag into every action', () => {
    render(barWith({ disabled: true }));

    buttons().forEach((button: HTMLElement): void => {
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeEnabled();
    });
  });

  it('keeps every disabled action focusable and in the tab order', async () => {
    const user: UserEvent = userEvent.setup();
    render(barWith({ disabled: true }));

    await user.tab();
    expect(nthOf(buttons(), 0)).toHaveFocus();
    await user.tab();
    expect(nthOf(buttons(), 1)).toHaveFocus();
  });

  it('never drops focus when a focused action flips disabled (SC 2.4.3)', () => {
    const { rerender } = render(barWith({}));
    nthOf(buttons(), 0).focus();
    expect(nthOf(buttons(), 0)).toHaveFocus();

    rerender(barWith({ disabled: true }));

    expect(nthOf(buttons(), 0)).toHaveFocus();
    expect(nthOf(buttons(), 0)).toHaveAttribute('aria-disabled', 'true');
  });

  it('no-ops activation for both the plain and the toggle lane', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const onToggle: jest.Mock = jest.fn();
    render(
      barWith({
        disabled: true,
        actions: [
          { icon: 'x-close', label: CLOSE, onActivate },
          { icon: 'eye', label: VISIBILITY, onToggle },
        ],
      })
    );

    await user.click(nthOf(buttons(), 0));
    nthOf(buttons(), 1).focus();
    await user.keyboard('{Enter}');

    expect(onActivate).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('no-ops a per-action disabled click while its siblings still fire', async () => {
    const user: UserEvent = userEvent.setup();
    const blocked: jest.Mock = jest.fn();
    const live: jest.Mock = jest.fn();
    render(
      barWith({
        actions: [
          { icon: 'x-close', label: CLOSE, onActivate: blocked, disabled: true },
          { icon: 'trash', label: DELETE, onActivate: live },
        ],
      })
    );

    await user.click(nthOf(buttons(), 0));
    await user.click(nthOf(buttons(), 1));

    expect(blocked).not.toHaveBeenCalled();
    expect(live).toHaveBeenCalledTimes(1);
  });

  it('leaves aria-disabled off a disabled but UNWIRED action (S2 beats S4)', () => {
    render(barWith({ disabled: true, actions: STATIC_ROW }));

    expect(ariaNodes()).toHaveLength(0);
  });
});

describe('UiActionIconBar — static branch (S2 zero-ARIA sweep)', () => {
  it('renders a bare div root with no group role and no name', () => {
    render(barWith({ actions: STATIC_ROW, id: 'static-row' }));

    const root: Element = firstOf(nodesMatching('#static-row'));
    expect(root.tagName).toBe('DIV');
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
  });

  it('exposes zero focusable elements and zero ARIA hooks anywhere in the tree', () => {
    render(barWith({ actions: STATIC_ROW }));

    expect(focusables()).toHaveLength(0);
    expect(ariaNodes()).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders each slot as a span while keeping the content tree identical', () => {
    const { rerender } = render(barWith({}));
    const wiredPaths: string[][] = svgs().map(pathsIn);

    rerender(barWith({ actions: STATIC_ROW }));

    expect(svgs().map(pathsIn)).toEqual(wiredPaths);
    expect(nodesMatching(`.${BACKDROP_CLASS}`)).toHaveLength(1);
    expect(nodesMatching('span[id]')).toHaveLength(0);
  });

  it('applies a per-action id to the static span too', () => {
    render(barWith({ actions: [{ icon: 'x-close', label: CLOSE, id: 'static-close' }] }));

    const slot: Element = firstOf(nodesMatching('#static-close'));
    expect(slot.tagName).toBe('SPAN');
    expect(slot).not.toHaveAttribute('role');
    expect(slot).not.toHaveAttribute('aria-label');
  });

  it('keeps a single unwired action static inside an otherwise wired bar', () => {
    render(
      barWith({
        actions: [
          { icon: 'x-close', label: CLOSE, onActivate: noop },
          { icon: 'trash', label: DELETE, id: 'static-trash' },
        ],
      })
    );

    expect(buttons()).toHaveLength(1);
    const slot: Element = firstOf(nodesMatching('#static-trash'));
    expect(slot.tagName).toBe('SPAN');
    expect(slot).not.toHaveAttribute('aria-label');
    expect(slot).not.toHaveAttribute('aria-disabled');
    expect(bar()).toHaveAttribute('role', 'group');
  });
});

describe('UiActionIconBar — live-region prohibition (S9)', () => {
  it('exposes none across rest, pressed, disabled and static', () => {
    const { rerender } = render(barWith({}));
    expectNoLiveRegion();

    rerender(
      barWith({ actions: [{ icon: 'eye', label: VISIBILITY, pressed: true, onToggle: noop }] })
    );
    expectNoLiveRegion();

    rerender(barWith({ disabled: true }));
    expectNoLiveRegion();

    rerender(barWith({ actions: STATIC_ROW }));
    expectNoLiveRegion();
  });

  it('exposes none after a real activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(barWith({ actions: [{ icon: 'x-close', label: CLOSE, onActivate }] }));

    await user.click(nthOf(buttons(), 0));

    expect(onActivate).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });
});

describe('UiActionIconBar — dev warnings', () => {
  it('stays silent for a healthy wired bar', () => {
    render(barWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays silent for a healthy static bar, even without a label', () => {
    render(barWith({ label: '', actions: STATIC_ROW }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a blank action label', () => {
    render(barWith({ actions: [{ icon: 'x-close', label: '   ', onActivate: noop }] }));
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('an action with a blank `label`')
    );
  });

  it('warns for a missing action label on a static action too', () => {
    render(barWith({ actions: [{ icon: 'x-close' } as unknown as UiActionIconBarAction] }));
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('an action with a blank `label`')
    );
  });

  it('warns instead of throwing on a non-string action label', () => {
    render(
      barWith({
        actions: [
          { icon: 'x-close', label: 42, onActivate: noop } as unknown as UiActionIconBarAction,
        ],
      })
    );
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('an action with a blank `label`')
    );
  });

  it('warns instead of throwing on a non-string bar label', () => {
    render(barWith({ label: 42 as unknown as string }));
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('while at least one action is wired')
    );
  });

  it('warns for a blank bar label once at least one action is wired', () => {
    render(barWith({ label: '  ' }));
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('while at least one action is wired')
    );
  });

  it('warns for a missing bar label on a wired bar', () => {
    render(barWith({ label: undefined }));
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('while at least one action is wired')
    );
  });

  it('warns for `pressed` on an action that is not a toggle', () => {
    render(
      barWith({ actions: [{ icon: 'eye', label: VISIBILITY, pressed: true, onActivate: noop }] })
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('`pressed` is IGNORED'));
  });

  it('warns for a menuId with no menuOpen', () => {
    render(
      barWith({
        actions: [{ icon: 'dots-vertical', label: ROW_MENU, menuId: 'm', onActivate: noop }],
      })
    );
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('`menuId` on an action with no `menuOpen`')
    );
  });

  it('stays silent for a fully wired popup action', () => {
    render(
      barWith({
        actions: [
          {
            icon: 'dots-vertical',
            label: ROW_MENU,
            hasPopup: 'menu',
            menuOpen: false,
            menuId: 'm',
            onActivate: noop,
          },
        ],
      })
    );
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('reports the action-label failure ahead of the bar-label one', () => {
    render(barWith({ label: '', actions: [{ icon: 'x-close', label: '', onActivate: noop }] }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(
      expect.stringContaining('an action with a blank `label`')
    );
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(barWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(barWith({ label: '   ' }));
    rerender(barWith({ label: undefined, disabled: true }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(
      barWith({ actions: [{ icon: 'eye', label: VISIBILITY, pressed: true, onActivate: noop }] })
    );
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('`pressed` is IGNORED'));
  });

  it('emits nothing in production, for any of the four warnings', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(
        barWith({ label: '', actions: [{ icon: 'x-close', label: '' }] })
      );
      rerender(barWith({ label: '' }));
      rerender(
        barWith({ actions: [{ icon: 'eye', label: VISIBILITY, pressed: true, onActivate: noop }] })
      );
      rerender(
        barWith({ actions: [{ icon: 'x-close', label: CLOSE, menuId: 'm', onActivate: noop }] })
      );
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiActionIconBar — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(barWith({ sx: { marginTop: '1rem' } }));
    expect(bar()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(
      barWith({
        actions: STATIC_ROW,
        id: 'styled',
        sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }],
      })
    );

    const root: Element = firstOf(nodesMatching('#styled'));
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('actionIconBarSx — row assembly (pure, mutation-killing)', () => {
  it('pins the row to the derived 12px slot rhythm', () => {
    const base: StyleObject = firstOf(barLayers(undefined));

    expect(base.display).toBe('flex');
    expect(base.alignItems).toBe('center');
    // 0.75rem is the MODAL measured slot gap; the 4px/5px Figma gaps are board
    // noise and are deliberately not reproduced.
    expect(base.gap).toBe('0.75rem');
    expect(base.boxSizing).toBe('border-box');
    expect(base.margin).toBe(0);
    expect(base.padding).toBe(0);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(barLayers(undefined)).toHaveLength(2);
    expect(barLayers(undefined)[1]).toEqual({});
    expect(barLayers({ marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: StyleObject[] = barLayers([{ marginTop: '1rem' }, { paddingTop: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ paddingTop: '2rem' });
  });

  it('ships no row chrome of its own — no border, background or radius', () => {
    const base: StyleObject = firstOf(barLayers(undefined));

    expect(base.border).toBeUndefined();
    expect(base.backgroundColor).toBeUndefined();
    expect(base.borderRadius).toBeUndefined();
  });
});

describe('actionButtonSx — slot assembly (pure, mutation-killing)', () => {
  it('freezes the 24px slot geometry in every branch', () => {
    const wired: StyleObject = slotOf('x-close', true);
    const staticSlot: StyleObject = slotOf('x-close', false);

    // The settings slot is the one exception to the 1.5rem square: its Figma
    // instance is natively 30x30, so both branches size it 1.875rem.
    [slotOf('settings', true), slotOf('settings', false)].forEach((slot: StyleObject): void => {
      expect(slot.width).toBe('1.875rem');
      expect(slot.height).toBe('1.875rem');
    });
    [wired, staticSlot].forEach((base: StyleObject): void => {
      expect(base.width).toBe('1.5rem');
      expect(base.height).toBe('1.5rem');
      expect(base.position).toBe('relative');
      expect(base.display).toBe('inline-flex');
      expect(base.alignItems).toBe('center');
      expect(base.justifyContent).toBe('center');
      expect(base.flexShrink).toBe(0);
      expect(base.boxSizing).toBe('border-box');
      expect(base.margin).toBe(0);
      expect(base.padding).toBe(0);
      expect(base.border).toBe('none');
      expect(base.borderRadius).toBe(0);
      expect(base.backgroundColor).toBe('transparent');
      expect(base.font).toBe('inherit');
      expect(base.lineHeight).toBe(0);
    });
  });

  it('paints the rest ink of each lane', () => {
    expect(slotOf('x-close', true).color).toBe(GREY_300);
    expect(slotOf('dots-horizontal', true).color).toBe(GREY_300);
    expect(slotOf('dots-vertical', true).color).toBe(GREY_300);
    expect(slotOf('settings', true).color).toBe(GREY_300);
    expect(slotOf('eye', true).color).toBe(GREY_300);
    expect(slotOf('trash', true).color).toBe(ERROR);
  });

  it('gates hover on the aria-disabled boundary and swaps only the stroke', () => {
    const neutral: StyleObject = slotOf('x-close', true);

    expect(keysMatching(neutral, ':hover')).toEqual([HOVER_SELECTOR]);
    expect(neutral['&:hover']).toBeUndefined();
    expect(ruleAt(neutral, HOVER_SELECTOR)).toEqual({ color: PRIMARY });
    // The eye is the documented anomaly: a visibility toggle is a neutral
    // affordance, so it hovers to grey200 rather than to primary.
    expect(ruleAt(slotOf('eye', true), HOVER_SELECTOR)).toEqual({ color: GREY_200 });
    expect(ruleAt(slotOf('trash', true), HOVER_SELECTOR)).toEqual({ color: STROKE_DANGER });
  });

  it('paints the pressed ink and the danger plate off the same gated :active rule', () => {
    const neutral: StyleObject = slotOf('dots-vertical', true);
    const danger: StyleObject = slotOf('trash', true);

    expect(keysMatching(neutral, ':active')).toEqual([ACTIVE_SELECTOR]);
    expect(ruleAt(neutral, ACTIVE_SELECTOR)).toEqual({
      color: BTN_ACTIVE,
      [BACKDROP_SELECTOR]: null,
    });
    // The eye never leaves the grey family: the design ships no blue anywhere on
    // the visibility toggle, so its press ink stays the rest grey300 instead of
    // borrowing the siblings' containedButtonActive feedback.
    expect(ruleAt(slotOf('eye', true), ACTIVE_SELECTOR)).toEqual({
      color: GREY_300,
      [BACKDROP_SELECTOR]: null,
    });
    expect(ruleAt(danger, ACTIVE_SELECTOR)).toEqual({
      color: STROKE_DANGER,
      [BACKDROP_SELECTOR]: { backgroundColor: DANGER_TINT },
    });
  });

  it('gives every lane the same grey400 disabled ink and a default cursor', () => {
    const lanes: readonly ActionIconName[] = ['x-close', 'eye', 'trash'];

    lanes.forEach((icon: ActionIconName): void => {
      expect(ruleAt(slotOf(icon, true), DISABLED_SELECTOR)).toEqual({
        cursor: 'default',
        color: GREY_400,
      });
    });
  });

  it('ships the ring as the Amendment A1 two-selector list', () => {
    const base: StyleObject = slotOf('x-close', true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,3,0), so on a
    // focused AND hovered action the hover ink alone would win. The second copy
    // repeats hover's own negation to tie it; declared later, it wins. The bare
    // one still covers the disabled action.
    expect(ringKeys).toEqual([FOCUS_SELECTORS]);
    expect(ruleAt(base, FOCUS_SELECTORS)).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
  });

  it('declares the ring after the hover AND the active rules', () => {
    const keys: string[] = Object.keys(slotOf('trash', true));
    const hover: number = keys.indexOf(HOVER_SELECTOR);
    const active: number = keys.indexOf(ACTIVE_SELECTOR);
    const ring: number = keys.indexOf(FOCUS_SELECTORS);

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(active).toBeGreaterThan(hover);
    expect(ring).toBeGreaterThan(active);
  });

  it('carries the mandatory forced-colors fallback', () => {
    expect(slotOf('x-close', true)['@media (forced-colors: active)']).toEqual({
      // The SAME selector list as the ring rule, not a bare `:focus-visible`:
      // a media query adds no specificity, so the shorter selector would lose to
      // the ring's own `outline: none` and leave forced-colors users no indicator.
      [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('omits every button-only rule from the static branch', () => {
    const base: StyleObject = slotOf('trash', false);

    expect(base.cursor).toBeUndefined();
    expect(base.appearance).toBeUndefined();
    expect(base[DISABLED_SELECTOR]).toBeUndefined();
    expect(base['@media (forced-colors: active)']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':active')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    // The rest ink and the geometry are identical, which is what makes both
    // branches paint the same rest presentation.
    expect(base.color).toBe(ERROR);
  });

  it('adds cursor and appearance to the wired branch only', () => {
    expect(slotOf('x-close', true).cursor).toBe('pointer');
    expect(slotOf('x-close', true).appearance).toBe('none');
  });

  it('ships no transition and no animation anywhere', () => {
    const serialised: string = JSON.stringify([
      slotOf('x-close', true),
      slotOf('eye', true),
      slotOf('trash', true),
      slotOf('trash', false),
      barLayers(undefined),
      actionBackdropSx,
      glyphLayerSx,
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });
});

describe('action-icon-bar styles — backdrop and glyph layers', () => {
  it('reproduces Frame 5441 as a centred 40x40 plate that cannot reflow the slot', () => {
    const plate: StyleObject = actionBackdropSx as StyleObject;

    expect(plate.position).toBe('absolute');
    expect(plate.width).toBe('2.5rem');
    expect(plate.height).toBe('2.5rem');
    expect(plate.top).toBe('50%');
    expect(plate.left).toBe('50%');
    expect(plate.marginTop).toBe('-1.25rem');
    expect(plate.marginLeft).toBe('-1.25rem');
    expect(plate.borderRadius).toBe('0.5rem');
    // Transparent at rest: only the gated `:active` rule tints it.
    expect(plate.backgroundColor).toBe('transparent');
    expect(plate.pointerEvents).toBe('none');
  });

  it('keeps the glyph above the plate through DOM order, with no z-index', () => {
    const layer: StyleObject = glyphLayerSx as StyleObject;

    expect(layer.position).toBe('relative');
    expect(layer.display).toBe('inline-flex');
    expect(layer.zIndex).toBeUndefined();
  });

  it('grants a backdrop to the danger lane alone', () => {
    expect(hasBackdrop('trash')).toBe(true);
    expect(hasBackdrop('x-close')).toBe(false);
    expect(hasBackdrop('dots-horizontal')).toBe(false);
    expect(hasBackdrop('dots-vertical')).toBe(false);
    expect(hasBackdrop('eye')).toBe(false);
    expect(hasBackdrop('settings')).toBe(false);
  });

  it('exposes the class hook under the repo naming convention', () => {
    expect(BACKDROP_CLASS).toBe('ui-action-icon-bar__backdrop');
  });
});

describe('icon-paths — the seven Figma vectors, pinned verbatim', () => {
  it('pins the single-path glyphs', () => {
    expect(X_CLOSE_PATH).toBe(EXPECTED_X_CLOSE);
    expect(EYE_OFF_PATH).toBe(EXPECTED_EYE_OFF);
    expect(SETTINGS_PATH).toBe(EXPECTED_SETTINGS);
    expect(TRASH_PATH).toBe(EXPECTED_TRASH);
  });

  it('pins the multi-subpath glyphs, in Figma subpath order', () => {
    expect(DOTS_HORIZONTAL_PATHS).toEqual(EXPECTED_DOTS_HORIZONTAL);
    expect(DOTS_VERTICAL_PATHS).toEqual(EXPECTED_DOTS_VERTICAL);
    expect(EYE_PATHS).toEqual(EXPECTED_EYE);
  });

  it('keeps every fragment join collapsed to single spaces', () => {
    const all: readonly string[] = [
      X_CLOSE_PATH,
      EYE_OFF_PATH,
      SETTINGS_PATH,
      TRASH_PATH,
      ...DOTS_HORIZONTAL_PATHS,
      ...DOTS_VERTICAL_PATHS,
      ...EYE_PATHS,
    ];

    expect(all).toHaveLength(12);
    all.forEach((path: string): void => {
      expect(path).not.toMatch(/\s\s|\n/);
      expect(path.startsWith('M')).toBe(true);
    });
  });
});

describe('useActionIconBar — bar view model', () => {
  function modelFor(props: UiActionIconBarProps): ActionIconBarModel {
    return renderHook((): ActionIconBarModel => useActionIconBar(props)).result.current;
  }

  it('marks a bar with at least one callback interactive', () => {
    expect(modelFor({ label: BAR_LABEL, actions: WIRED_ROW }).interactive).toBe(true);
    expect(modelFor({ label: BAR_LABEL, actions: STATIC_ROW }).interactive).toBe(false);
  });

  it('coerces a nullish actions array to an empty, non-interactive row', () => {
    const model: ActionIconBarModel = modelFor({
      label: BAR_LABEL,
      actions: undefined as unknown as readonly UiActionIconBarAction[],
    });

    expect(model.actions).toEqual([]);
    expect(model.interactive).toBe(false);
  });

  it('coerces a nullish bar disabled flag to false', () => {
    expect(modelFor({ label: BAR_LABEL, actions: WIRED_ROW }).disabled).toBe(false);
    expect(modelFor({ label: BAR_LABEL, actions: WIRED_ROW, disabled: true }).disabled).toBe(true);
    expect(modelFor({ label: BAR_LABEL, actions: WIRED_ROW, disabled: false }).disabled).toBe(
      false
    );
  });
});

describe('useActionState — per-action view model', () => {
  function stateFor(action: UiActionIconBarAction, barDisabled: boolean = false): ActionState {
    return renderHook((): ActionState => useActionState({ action, barDisabled })).result.current;
  }

  it('switches interactivity on callback presence alone', () => {
    expect(isWiredAction({ icon: 'x-close', label: CLOSE })).toBe(false);
    expect(isWiredAction({ icon: 'x-close', label: CLOSE, onActivate: noop })).toBe(true);
    expect(isWiredAction({ icon: 'eye', label: VISIBILITY, onToggle: noop })).toBe(true);
  });

  it('leaves aria-disabled off an unwired action even when the bar is disabled', () => {
    const state: ActionState = stateFor({ icon: 'x-close', label: CLOSE, disabled: true }, true);

    expect(state.interactive).toBe(false);
    expect(state.ariaDisabled).toBeUndefined();
  });

  it('sets aria-disabled only for a wired AND disabled action', () => {
    expect(
      stateFor({ icon: 'x-close', label: CLOSE, onActivate: noop }).ariaDisabled
    ).toBeUndefined();
    expect(
      stateFor({ icon: 'x-close', label: CLOSE, onActivate: noop, disabled: true }).ariaDisabled
    ).toBe(true);
    expect(stateFor({ icon: 'x-close', label: CLOSE, onActivate: noop }, true).ariaDisabled).toBe(
      true
    );
    expect(
      stateFor({ icon: 'x-close', label: CLOSE, onActivate: noop, disabled: false }).ariaDisabled
    ).toBeUndefined();
  });

  it('exposes aria-pressed on a toggle only, coerced from nullish', () => {
    expect(stateFor({ icon: 'eye', label: VISIBILITY, onToggle: noop }).ariaPressed).toBe(false);
    expect(
      stateFor({ icon: 'eye', label: VISIBILITY, onToggle: noop, pressed: true }).ariaPressed
    ).toBe(true);
    expect(
      stateFor({ icon: 'eye', label: VISIBILITY, onActivate: noop, pressed: true }).ariaPressed
    ).toBeUndefined();
    expect(
      stateFor({ icon: 'eye', label: VISIBILITY, onActivate: noop, pressed: true }).pressed
    ).toBe(false);
  });

  it('renders aria-controls only while the menu is open', () => {
    const closed: ActionState = stateFor({
      icon: 'dots-vertical',
      label: ROW_MENU,
      menuOpen: false,
      menuId: 'm',
      onActivate: noop,
    });
    const open: ActionState = stateFor({
      icon: 'dots-vertical',
      label: ROW_MENU,
      hasPopup: 'menu',
      menuOpen: true,
      menuId: 'm',
      onActivate: noop,
    });

    expect(closed.ariaControls).toBeUndefined();
    expect(closed.ariaHasPopup).toBeUndefined();
    expect(closed.ariaExpanded).toBe(false);
    expect(open.ariaControls).toBe('m');
    expect(open.ariaHasPopup).toBe('menu');
    expect(open.ariaExpanded).toBe(true);
  });

  it('swallows activation while disabled, before any callback work', () => {
    const onActivate: jest.Mock = jest.fn();
    const perAction: ActionState = stateFor({
      icon: 'x-close',
      label: CLOSE,
      onActivate,
      disabled: true,
    });
    perAction.onActivate();

    const barWide: ActionState = stateFor({ icon: 'x-close', label: CLOSE, onActivate }, true);
    barWide.onActivate();

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('gives a toggle one activation path, and never throws on an unwired action', () => {
    const onToggle: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    stateFor({ icon: 'eye', label: VISIBILITY, onToggle, onActivate }).onActivate();

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
    expect(() => stateFor({ icon: 'x-close', label: CLOSE }).onActivate()).not.toThrow();
  });
});

describe('actionIconBarWarning — first applicable (pure)', () => {
  function warningFor(props: UiActionIconBarProps): string | null {
    return actionIconBarWarning(props);
  }

  it('returns null for a healthy wired bar and a healthy static one', () => {
    expect(warningFor({ label: BAR_LABEL, actions: WIRED_ROW })).toBeNull();
    expect(warningFor({ label: '', actions: STATIC_ROW })).toBeNull();
  });

  it('tolerates a nullish actions array', () => {
    expect(
      warningFor({
        label: '',
        actions: undefined as unknown as readonly UiActionIconBarAction[],
      })
    ).toBeNull();
  });

  it('reports each contract breach in first-applicable order', () => {
    expect(warningFor({ label: BAR_LABEL, actions: [{ icon: 'x-close', label: ' ' }] })).toContain(
      'an action with a blank `label`'
    );
    expect(
      warningFor({ label: '', actions: [{ icon: 'x-close', label: CLOSE, onActivate: noop }] })
    ).toContain('while at least one action is wired');
    expect(
      warningFor({
        label: BAR_LABEL,
        actions: [{ icon: 'eye', label: VISIBILITY, pressed: false, onActivate: noop }],
      })
    ).toContain('`pressed` is IGNORED');
    expect(
      warningFor({
        label: BAR_LABEL,
        actions: [{ icon: 'dots-vertical', label: ROW_MENU, menuId: 'm', onActivate: noop }],
      })
    ).toContain('`menuId` on an action with no `menuOpen`');
  });

  it('accepts a toggle carrying pressed, and a fully wired popup', () => {
    expect(
      warningFor({
        label: BAR_LABEL,
        actions: [
          { icon: 'eye', label: VISIBILITY, pressed: true, onToggle: noop },
          {
            icon: 'dots-vertical',
            label: ROW_MENU,
            hasPopup: 'menu',
            menuOpen: false,
            menuId: 'm',
            onActivate: noop,
          },
        ],
      })
    ).toBeNull();
  });
});
