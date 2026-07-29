import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiProfileSelectCard } from '../../src/components';
import { activateMenuItem } from '../../src/components/ui-profile-select-card/menu-actions';
import {
  focusMenuEnd,
  isInsideWidget,
  moveMenuFocus,
} from '../../src/components/ui-profile-select-card/menu-focus';
import type {
  MenuFocusContext,
  MenuFocusRefs,
} from '../../src/components/ui-profile-select-card/menu-refs';
import {
  menuItemSx,
  profileMenuSx,
  profileTriggerSx,
  profileWrapperSx,
} from '../../src/components/ui-profile-select-card/styles';
import type {
  ProfileSelectItem,
  UiProfileSelectCardProps,
} from '../../src/components/ui-profile-select-card/types';

import mockConsoleWarn from './utils/mock-console-warn';

// UiProfileSelectCard emits the five dev-only §12 warnings via console.warn;
// silence them for the suite and keep a handle for the assertions on them.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma sample card (literal strings preserved). The trigger's accessible
// name is the person name alone — the avatar is decorative and the chevron is
// aria-hidden (a11y contract §5.1/§5.2/§5.3).
const NAME: string = 'Евгения Маслова';
const AVATAR: string = '/evgeniya.png';
const PROFILE: string = 'Профиль';
const SETTINGS: string = 'Настройки';
const LOGOUT: string = 'Выйти';
const ITEMS: ProfileSelectItem[] = [
  { id: 'profile', label: PROFILE },
  { id: 'settings', label: SETTINGS },
  { id: 'logout', label: LOGOUT },
];
const OUTSIDE: string = 'outside';

interface CardOverrides {
  name?: string;
  avatarSrc?: UiProfileSelectCardProps['avatarSrc'];
  items?: ProfileSelectItem[];
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  onSelect?: (itemId: string) => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: UiProfileSelectCardProps['sx'];
  menuSx?: UiProfileSelectCardProps['menuSx'];
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks
// keep the "runtime data violates the prop type" fixtures — a missing name, a
// nullish avatar, absent items — expressible as an explicit `undefined`.
function cardWith(extra: Readonly<CardOverrides>): React.ReactElement {
  const name: string = ('name' in extra ? extra.name : NAME) as string;
  const avatarSrc: UiProfileSelectCardProps['avatarSrc'] = (
    'avatarSrc' in extra ? extra.avatarSrc : AVATAR
  ) as UiProfileSelectCardProps['avatarSrc'];
  const items: ProfileSelectItem[] = (
    'items' in extra ? extra.items : ITEMS
  ) as ProfileSelectItem[];
  return (
    <UiProfileSelectCard
      name={name}
      avatarSrc={avatarSrc}
      items={items}
      open={extra.open}
      onOpenChange={extra.onOpenChange}
      onSelect={extra.onSelect}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
      menuSx={extra.menuSx}
    />
  );
}

// A neighbour control, so Tab and outside pointer interactions have a real
// destination instead of falling back to <body>.
function neighbourButton(): React.ReactElement {
  return (
    <button type="button" id="neighbour">
      {OUTSIDE}
    </button>
  );
}

interface ControlledCardProps {
  onOpenChange?: (next: boolean) => void;
  onSelect?: (itemId: string) => void;
  items?: ProfileSelectItem[];
  disabled?: boolean;
  initialOpen?: boolean;
}

// The consumer half of the ownership split (§3.1/§4): it owns `open` and simply
// renders back whatever the card requests. Every real open/close flow runs
// through this; the exact-call-count assertions that must NOT re-render use a
// fixed `open` prop with a bare spy instead.
function ControlledCard(props: Readonly<ControlledCardProps>): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(props.initialOpen ?? false);
  const report: (next: boolean) => void = props.onOpenChange ?? noop;
  const handleOpenChange: (next: boolean) => void = (next: boolean): void => {
    report(next);
    setOpen(next);
  };
  return cardWith({
    open,
    onOpenChange: handleOpenChange,
    onSelect: props.onSelect,
    items: props.items ?? ITEMS,
    disabled: props.disabled,
  });
}

function renderControlled(props: Readonly<ControlledCardProps> = {}): void {
  render(
    <>
      <ControlledCard
        onOpenChange={props.onOpenChange}
        onSelect={props.onSelect}
        items={props.items}
        disabled={props.disabled}
        initialOpen={props.initialOpen}
      />
      {neighbourButton()}
    </>
  );
}

// A consumer that hands the card a brand-new callback ref on every render, so
// React detaches the trigger node before the closing render's effect cleanup.
interface RefChurningCardProps {
  open: boolean;
  tick: number;
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

// A callback ref stamped with the render's `tick`, so its identity changes
// whenever the tick does.
function refForTick(tick: number): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    void `${tick}:${node?.tagName ?? ''}`;
  };
}

function RefChurningCard({ open, tick }: Readonly<RefChurningCardProps>): React.ReactElement {
  const collect: (node: HTMLButtonElement | null) => void = React.useMemo(
    (): ((node: HTMLButtonElement | null) => void) => refForTick(tick),
    [tick]
  );
  return (
    <UiProfileSelectCard
      ref={collect}
      name={NAME}
      avatarSrc={AVATAR}
      items={ITEMS}
      open={open}
      onOpenChange={noop}
    />
  );
}

// The ref bundle the card builds internally, rebuilt here so the module-level
// actions can be exercised without a mounted widget.
function bareRefs(): MenuFocusRefs {
  return {
    wrapper: { current: null },
    trigger: { current: null },
    menu: { current: null },
    intent: { current: null },
    focusInside: { current: false },
    skipRescue: { current: false },
  };
}

function trigger(): HTMLElement {
  return screen.getByRole('button', { name: NAME });
}

function menu(): HTMLElement {
  return screen.getByRole('menu');
}

function menuItems(): HTMLElement[] {
  return screen.getAllByRole('menuitem');
}

function itemNamed(label: string): HTMLElement {
  return screen.getByRole('menuitem', { name: label });
}

function neighbour(): HTMLElement {
  return screen.getByRole('button', { name: OUTSIDE });
}

// The avatar is decorative (`alt=""`), so it drops out of the accessibility tree
// and is reached by node query rather than by role — the task-card precedent.
function cardImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img'));
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// The positioning wrapper carries `lang` and the consumer `sx` but no role at
// all (§2.1), so it is reached structurally: Testing Library mounts the tree
// inside one container div, and the wrapper is its first element child.
function widgetRoot(): Element {
  return nodesMatching('body > div > div')[0];
}

// Every ARIA/interactivity hook the static branch must not ship (§3.3/§6.2).
// `aria-hidden` is excluded on purpose: the decorative chevron carries it in
// both branches.
const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-haspopup], [aria-expanded], [aria-controls], ' +
  '[aria-disabled], [aria-label], [aria-labelledby], [aria-describedby]';

// A bare `aria-live` container has no implicit role, so role queries alone leave
// a hole; sweep the attributes too (a11y contract §8.1).
function liveRegionNodes(): Element[] {
  return Array.from(
    document.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant], output')
  );
}

function expectNoLiveRegion(): void {
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('log')).not.toBeInTheDocument();
  expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  expect(screen.queryByRole('marquee')).not.toBeInTheDocument();
  expect(liveRegionNodes()).toHaveLength(0);
}

type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function triggerStyle(interactive: boolean, disabled: boolean): StyleObject {
  return profileTriggerSx({ interactive, disabled }) as StyleObject;
}

function wrapperLayers(sx: UiProfileSelectCardProps['sx']): SxLayers {
  return profileWrapperSx(sx) as SxLayers;
}

function menuLayers(sx: UiProfileSelectCardProps['menuSx']): SxLayers {
  return profileMenuSx(sx) as SxLayers;
}

const FOCUS_RING: string = 'inset 0 0 0 2px #1A1C1E';

describe('UiProfileSelectCard — wired trigger semantics (§1.2/§2)', () => {
  it('renders one native type="button" trigger with the APG menu-button wiring', () => {
    render(cardWith({ onOpenChange: noop }));

    const button: HTMLElement = trigger();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).not.toHaveAttribute('role');
    expect(button).not.toHaveAttribute('aria-label');
  });

  it('keeps exactly one button in the tree while the menu is open', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    // The rows are `role="menuitem"`, so they never surface as buttons.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(menuItems()).toHaveLength(3);
  });

  it('mounts the menu only while open and never leaves a dangling aria-controls', () => {
    const { rerender } = render(cardWith({ onOpenChange: noop }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).not.toHaveAttribute('aria-controls');

    rerender(cardWith({ open: true, onOpenChange: noop }));
    const controls: string = menu().getAttribute('id') ?? '';
    expect(controls).not.toBe('');
    expect(trigger()).toHaveAttribute('aria-controls', controls);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');

    rerender(cardWith({ onOpenChange: noop }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('names the menu after the trigger id and adds no aria-label to it', () => {
    render(cardWith({ id: 'profile-card', open: true, onOpenChange: noop }));

    expect(trigger()).toHaveAttribute('id', 'profile-card');
    expect(menu()).toHaveAttribute('aria-labelledby', 'profile-card');
    expect(menu()).not.toHaveAttribute('aria-label');
    expect(menu()).toHaveAccessibleName(NAME);
  });

  it('generates the trigger id when the consumer omits one', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    const generated: string = trigger().getAttribute('id') ?? '';
    expect(generated).not.toBe('');
    expect(menu()).toHaveAttribute('aria-labelledby', generated);
    expect(menu()).toHaveAttribute('id', `${generated}-menu`);
  });

  it('renders every row as a native type="button" menuitem with tabindex -1', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    const rows: HTMLElement[] = menuItems();
    expect(rows.map((row: HTMLElement) => row.textContent)).toEqual([PROFILE, SETTINGS, LOGOUT]);
    rows.forEach((row: HTMLElement) => {
      expect(row.tagName).toBe('BUTTON');
      expect(row).toHaveAttribute('type', 'button');
      expect(row).toHaveAttribute('tabindex', '-1');
      expect(row).not.toHaveAttribute('aria-label');
      expect(row).not.toHaveAttribute('aria-selected');
      expect(row).not.toHaveAttribute('aria-disabled');
    });
    // Direct children of the menu container — no <ul>/<li> interposition (§2.2).
    expect(nodesMatching('[role="menu"] > [role="menuitem"]')).toHaveLength(3);
    expect(nodesMatching('[role="menu"] li')).toHaveLength(0);
  });

  it('exposes no combobox, listbox or activedescendant wiring', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    expect(trigger()).not.toHaveAttribute('aria-activedescendant');
    expect(menu()).not.toHaveAttribute('aria-activedescendant');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('applies lang to the wrapper only when the consumer supplies it', () => {
    const { rerender } = render(cardWith({ onOpenChange: noop }));
    expect(nodesMatching('[lang]')).toHaveLength(0);

    rerender(cardWith({ lang: 'ru', onOpenChange: noop }));
    const tagged: Element[] = nodesMatching('[lang]');
    expect(tagged).toHaveLength(1);
    expect(tagged[0]).toBe(widgetRoot());
    expect(widgetRoot().contains(trigger())).toBe(true);
  });

  it('exposes its display name', () => {
    expect(UiProfileSelectCard.displayName).toBe('UiProfileSelectCard');
  });
});

describe('UiProfileSelectCard — static (unwired) card (§3.3/§13.7)', () => {
  it('exposes zero buttons and zero ARIA hooks', () => {
    render(cardWith({}));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
    expect(screen.getByText(NAME)).toBeInTheDocument();
  });

  it('never renders the menu, even when open is passed', () => {
    render(cardWith({ open: true }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('keeps the identical content tree, including the consumer id', () => {
    render(cardWith({ id: 'static-card' }));

    const root: Element = nodesMatching('#static-card')[0];
    expect(root.tagName).toBe('DIV');
    expect(cardImages()).toHaveLength(1);
    expect(nodesMatching('svg')).toHaveLength(1);
  });

  it('shows no aria-disabled on a disabled static card (§6.2)', () => {
    render(cardWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });
});

describe('UiProfileSelectCard — empty items and disabled dominance (§3.4/§6.3)', () => {
  it('renders no menu for a wired, open card with zero items', () => {
    render(cardWith({ items: [], open: true, onOpenChange: noop }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('empty `items` array'));
  });

  it('survives a runtime-nullish items list with no menu and no crash', () => {
    render(cardWith({ items: undefined, onOpenChange: noop }));

    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('lets disabled dominate open: closed presentation, no self-emitted close', () => {
    const onOpenChange: jest.Mock = jest.fn();
    render(cardWith({ open: true, disabled: true, onOpenChange }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('`disabled` wins'));
  });

  it('rescues focus to the trigger when disabled unmounts the open menu', () => {
    const onOpenChange: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({ open: true, onOpenChange }));
    expect(itemNamed(PROFILE)).toHaveFocus();

    rerender(cardWith({ open: true, disabled: true, onOpenChange }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(document.body).not.toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('UiProfileSelectCard — disabled (aria-disabled boundary, §6.1)', () => {
  it('stays a focusable button with aria-disabled and no native disabled', () => {
    render(cardWith({ disabled: true, onOpenChange: noop }));

    const button: HTMLElement = trigger();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.getAttributeNames()).not.toContain('disabled');
    expect(button).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(cardWith({ disabled: true, onOpenChange: noop }));

    await user.tab();
    expect(trigger()).toHaveFocus();
  });

  it('no-ops every open path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    render(cardWith({ disabled: true, onOpenChange }));

    await user.click(trigger());
    trigger().focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}');

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('retains focus when a focused trigger flips disabled, then restores opening', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({ onOpenChange }));

    const button: HTMLElement = trigger();
    button.focus();
    rerender(cardWith({ disabled: true, onOpenChange }));

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
    expect(document.body).not.toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(cardWith({ onOpenChange }));
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe('UiProfileSelectCard — open transition focus (§4.2/§13.2)', () => {
  it('focuses the first row on ArrowDown', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    trigger().focus();
    await user.keyboard('{ArrowDown}');

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(itemNamed(PROFILE)).toHaveFocus();
  });

  it('focuses the last row on ArrowUp', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    trigger().focus();
    await user.keyboard('{ArrowUp}');

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(itemNamed(LOGOUT)).toHaveFocus();
  });

  it('focuses the first row on a pointer open', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled();

    await user.click(trigger());
    expect(itemNamed(PROFILE)).toHaveFocus();
  });

  it('focuses the first row on Enter and on Space (native activation)', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    trigger().focus();
    await user.keyboard('{Enter}');
    expect(itemNamed(PROFILE)).toHaveFocus();
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    trigger().focus();
    await user.keyboard(' ');
    expect(itemNamed(PROFILE)).toHaveFocus();
    expect(onOpenChange).toHaveBeenCalledTimes(3);
  });

  it('focuses the first row on a programmatic open with no recorded intent', () => {
    const { rerender } = render(cardWith({ onOpenChange: noop }));
    rerender(cardWith({ open: true, onOpenChange: noop }));

    expect(itemNamed(PROFILE)).toHaveFocus();
  });

  it('ignores non-arrow keys on the closed trigger', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    trigger().focus();
    await user.keyboard('{ArrowLeft}{ArrowRight}{Home}{End}{Escape}a');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('leaves the closed trigger as the only tab stop (the menu adds none)', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled();

    expect(nodesMatching('[tabindex]')).toHaveLength(0);
    await user.tab();
    expect(trigger()).toHaveFocus();
    await user.tab();
    expect(neighbour()).toHaveFocus();
  });
});

describe('UiProfileSelectCard — menu navigation (§4.3/§13.2)', () => {
  it('walks down and wraps to the first row at the end', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled({ initialOpen: true });

    expect(itemNamed(PROFILE)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(itemNamed(SETTINGS)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(itemNamed(LOGOUT)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(itemNamed(PROFILE)).toHaveFocus();
  });

  it('walks up and wraps to the last row at the start', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled({ initialOpen: true });

    await user.keyboard('{ArrowUp}');
    expect(itemNamed(LOGOUT)).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(itemNamed(SETTINGS)).toHaveFocus();
  });

  it('jumps to the ends with Home and End', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled({ initialOpen: true });

    await user.keyboard('{End}');
    expect(itemNamed(LOGOUT)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(itemNamed(PROFILE)).toHaveFocus();
  });

  it('leaves every other key to the rows themselves', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    const onSelect: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange, onSelect });

    await user.keyboard('{ArrowLeft}{ArrowRight}{PageDown}x');
    expect(itemNamed(PROFILE)).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('falls back to the first row when focus sits on no row at all', () => {
    render(cardWith({ open: true, onOpenChange: noop }));
    const rows: HTMLElement[] = menuItems();

    rows[0].blur();
    expect(document.body).toHaveFocus();

    // ArrowDown from "nowhere" resolves to index 0 + 1, ArrowUp to 0 - 1 (wrapped).
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(rows[1]).toHaveFocus();

    rows[1].blur();
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(rows[2]).toHaveFocus();
  });
});

describe('UiProfileSelectCard — item activation (§4.4/§13.1)', () => {
  it('activates once on click: trigger focus, then select, then close', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    const onSelect: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange, onSelect });

    await user.click(itemNamed(SETTINGS));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('settings');
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(trigger()).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('activates exactly once on Enter', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onSelect });

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('settings');
    expect(trigger()).toHaveFocus();
  });

  it('activates exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onSelect });

    await user.keyboard('{End} ');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('logout');
    expect(trigger()).toHaveFocus();
  });

  it('closes without a select callback when the consumer supplies none', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange });

    await user.click(itemNamed(PROFILE));

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(trigger()).toHaveFocus();
  });
});

describe('UiProfileSelectCard — close paths (§4.3/§4.5/§13.3/§13.4)', () => {
  it('Escape from a row focuses the trigger and requests exactly one close', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange });

    await user.keyboard('{Escape}');

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(trigger()).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Escape on the open trigger closes without moving focus', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange });

    trigger().focus();
    await user.keyboard('{Escape}');

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(trigger()).toHaveFocus();
  });

  it('Tab closes the menu and never yanks focus back to the trigger', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange });

    await user.tab();

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    // The binding assertion (§13.3): no focus call happens on the Tab path. Where
    // focus lands afterwards is the browser's business — jsdom resolves the Tab
    // destination after React has already unmounted the row, so it drops to
    // <body> here instead of stepping to the neighbour; the natural-step
    // behaviour is asserted below against a menu the consumer keeps mounted.
    expect(trigger()).not.toHaveFocus();
  });

  it('lets Tab step naturally out of a menu the consumer keeps open', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    render(
      <>
        {cardWith({ open: true, onOpenChange })}
        {neighbourButton()}
      </>
    );

    await user.tab();

    // No `preventDefault()` and no focus call, so focus proceeds out of the
    // widget on its own.
    expect(neighbour()).toHaveFocus();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls.every((call: boolean[]) => call[0] === false)).toBe(true);
  });

  it('Shift+Tab closes the menu the same way and leaves the rows', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    render(
      <>
        {cardWith({ open: true, onOpenChange })}
        {neighbourButton()}
      </>
    );

    await user.tab({ shift: true });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls.every((call: boolean[]) => call[0] === false)).toBe(true);
    // Focus left the rows on its own: the menu holds no tab stops, so the
    // previous stop is the trigger — reached by the browser, not by a component
    // focus call (which Tab-close is forbidden to make).
    menuItems().forEach((row: HTMLElement) => {
      expect(row).not.toHaveFocus();
    });
  });

  it('closes once on a trigger click while open, with no close-then-reopen', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    await user.click(trigger());
    await user.click(trigger());

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes on an outside pointerdown without stealing focus', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ initialOpen: true, onOpenChange });

    await user.click(neighbour());

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls.every((call: boolean[]) => call[0] === false)).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(neighbour()).toHaveFocus();
    expect(trigger()).not.toHaveFocus();
  });

  it('drops the outside listener once closed', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    await user.click(neighbour());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes when focus leaves the whole widget with no relatedTarget', () => {
    const onOpenChange: jest.Mock = jest.fn();
    render(cardWith({ open: true, onOpenChange }));

    itemNamed(PROFILE).blur();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ignores a blur that lands back inside the widget', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    render(cardWith({ open: true, onOpenChange }));

    await user.click(trigger());

    // The pointer close is the only request: the item → trigger focus move stays
    // inside the wrapper, so the focus-out path never fires.
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it('ignores focus leaving a closed card', async () => {
    const user: UserEvent = userEvent.setup();
    const onOpenChange: jest.Mock = jest.fn();
    renderControlled({ onOpenChange });

    trigger().focus();
    await user.tab();

    expect(neighbour()).toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('rescues focus to the trigger on a programmatic close, never to <body>', () => {
    const onOpenChange: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({ open: true, onOpenChange }));
    expect(itemNamed(PROFILE)).toHaveFocus();

    rerender(cardWith({ onOpenChange }));

    expect(trigger()).toHaveFocus();
    expect(document.body).not.toHaveFocus();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not rescue focus when the card unmounts entirely', () => {
    const { unmount } = render(cardWith({ open: true, onOpenChange: noop }));
    expect(itemNamed(PROFILE)).toHaveFocus();

    expect(() => unmount()).not.toThrow();
    expect(document.body).toHaveFocus();
  });
});

describe('UiProfileSelectCard — accessible names and imagery (§5/§13.9)', () => {
  it('names the trigger with the person name alone', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    expect(trigger()).toHaveAccessibleName(NAME);
    expect(nodesMatching('[aria-label]')).toHaveLength(0);
  });

  it('paints a decorative 32px avatar', () => {
    render(cardWith({ onOpenChange: noop }));

    const img: HTMLImageElement = cardImages()[0];
    expect(cardImages()).toHaveLength(1);
    expect(img).toHaveAttribute('src', AVATAR);
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('draggable', 'false');
    expect(img).not.toHaveAttribute('onerror');
  });

  it('accepts a static import object as the photo source', () => {
    render(cardWith({ avatarSrc: { src: '/imported.png' }, onOpenChange: noop }));
    expect(cardImages()[0]).toHaveAttribute('src', '/imported.png');
  });

  it('renders no photo for an empty, blank-object or nullish source', () => {
    const { rerender } = render(cardWith({ avatarSrc: '', onOpenChange: noop }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ avatarSrc: { src: '' }, onOpenChange: noop }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ avatarSrc: undefined, onOpenChange: noop }));
    expect(cardImages()).toHaveLength(0);
    expect(trigger()).toHaveAccessibleName(NAME);
  });

  it('keeps the chevron out of the accessibility tree and never rotates it', () => {
    const { rerender } = render(cardWith({ onOpenChange: noop }));

    const glyph: Element = nodesMatching('svg')[0];
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(glyph).toHaveAttribute('focusable', 'false');
    expect(nodesMatching('path')[0]).toHaveAttribute('d', 'M5 7.5 10 12.5 15 7.5');
    expect(nodesMatching('path')[0]).toHaveAttribute('stroke-width', '1.66667');

    rerender(cardWith({ open: true, onOpenChange: noop }));
    expect(nodesMatching('path')[0]).toHaveAttribute('d', 'M5 7.5 10 12.5 15 7.5');
  });

  it('names each row with its visible label and nothing else', () => {
    render(cardWith({ open: true, onOpenChange: noop }));

    expect(itemNamed(PROFILE)).toHaveAccessibleName(PROFILE);
    expect(itemNamed(SETTINGS)).toHaveAccessibleName(SETTINGS);
    expect(itemNamed(LOGOUT)).toHaveAccessibleName(LOGOUT);
  });
});

describe('UiProfileSelectCard — live-region prohibition (§8.1/§13.8)', () => {
  it('exposes none across the closed, open, focused and closed-again states', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    renderControlled({ onSelect });

    expectNoLiveRegion();
    await user.click(trigger());
    expectNoLiveRegion();

    await user.keyboard('{ArrowDown}');
    expectNoLiveRegion();

    await user.click(itemNamed(SETTINGS));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });

  it('exposes no live region after Escape', async () => {
    const user: UserEvent = userEvent.setup();
    renderControlled({ initialOpen: true });

    await user.keyboard('{Escape}');
    expectNoLiveRegion();
  });

  it('exposes no live region on disabled and static cards', () => {
    const { rerender } = render(cardWith({ disabled: true, onOpenChange: noop }));
    expectNoLiveRegion();

    rerender(cardWith({}));
    expectNoLiveRegion();
  });
});

describe('UiProfileSelectCard — dev warnings (§12)', () => {
  it('stays silent for a healthy wired card', () => {
    render(cardWith({ open: true, onOpenChange: noop, onSelect: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays silent for a healthy static card', () => {
    render(cardWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when onSelect is supplied without onOpenChange', () => {
    render(cardWith({ onSelect: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('warns for a blank name', () => {
    render(cardWith({ name: '   ', onOpenChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns for a missing name', () => {
    render(cardWith({ name: undefined, onOpenChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns for duplicate item ids', () => {
    render(
      cardWith({
        items: [
          { id: 'same', label: PROFILE },
          { id: 'same', label: LOGOUT },
        ],
        onOpenChange: noop,
      })
    );
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('duplicate item `id`s'));
  });

  it('emits nothing in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(cardWith({ name: '', open: true }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiProfileSelectCard — focus-return API', () => {
  it('forwards an object ref to the trigger button, never the wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(
      <UiProfileSelectCard
        ref={ref}
        name={NAME}
        avatarSrc={AVATAR}
        items={ITEMS}
        onOpenChange={noop}
      />
    );

    expect(ref.current).toBe(trigger());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(
      <UiProfileSelectCard
        ref={collect}
        name={NAME}
        avatarSrc={AVATAR}
        items={ITEMS}
        onOpenChange={noop}
      />
    );

    expect(seen[0]).toBe(trigger());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });
});

describe('UiProfileSelectCard — consumer sx', () => {
  it('applies an object sx to the wrapper and menuSx to the menu', () => {
    render(
      cardWith({
        open: true,
        onOpenChange: noop,
        sx: { marginTop: '1rem' },
        menuSx: { paddingTop: '2rem' },
      })
    );

    expect(widgetRoot()).toHaveStyle({ marginTop: '1rem' });
    expect(menu()).toHaveStyle({ paddingTop: '2rem' });
  });

  it('applies array sx layers to both surfaces', () => {
    render(
      cardWith({
        open: true,
        onOpenChange: noop,
        sx: [{ marginTop: '1rem' }, { marginBottom: '3rem' }],
        menuSx: [{ paddingTop: '2rem' }, { paddingBottom: '4rem' }],
      })
    );

    expect(widgetRoot()).toHaveStyle({ marginTop: '1rem', marginBottom: '3rem' });
    expect(menu()).toHaveStyle({ paddingTop: '2rem', paddingBottom: '4rem' });
  });
});

describe('profile-select styles — pure recipes (mutation-killing)', () => {
  it('pins the single-layer inset focus ring on the wired trigger', () => {
    const base: StyleObject = triggerStyle(true, false);

    expect(base['&:focus-visible']).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(base.cursor).toBe('pointer');
    expect(base.appearance).toBe('none');
    expect(base['&[aria-disabled="true"]']).toEqual({ cursor: 'default' });
  });

  it('gates hover on the aria-disabled boundary AND on the open state', () => {
    const base: StyleObject = triggerStyle(true, false);
    const hoverKeys: string[] = Object.keys(base).filter((key: string) => key.includes(':hover'));

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"]):not([aria-expanded="true"])']);
    expect(base[hoverKeys[0]]).toEqual({
      borderColor: '#969B9D',
      boxShadow: '0 8px 27px rgba(49, 59, 67, 0.14)',
    });
  });

  it('declares the focus ring after the hover recipe so it wins at equal specificity', () => {
    const keys: string[] = Object.keys(triggerStyle(true, false));
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const ring: number = keys.indexOf('&:focus-visible');

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(ring).toBeGreaterThan(hover);
  });

  it('keeps a forced-colors focus indicator on the trigger and the rows', () => {
    const forced: object = {
      '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
    };

    expect(triggerStyle(true, false)['@media (forced-colors: active)']).toEqual(forced);
    expect((menuItemSx as StyleObject)['@media (forced-colors: active)']).toEqual(forced);
  });

  it('omits every button-only rule from the static branch', () => {
    const base: StyleObject = triggerStyle(false, false);

    expect(base.cursor).toBeUndefined();
    expect(base.appearance).toBeUndefined();
    expect(base['&:focus-visible']).toBeUndefined();
    expect(base['@media (forced-colors: active)']).toBeUndefined();
    expect(Object.keys(base).filter((key: string) => key.includes(':hover'))).toEqual([]);
  });

  it('keeps the geometry identical across states, with a constant 1px border', () => {
    const rest: StyleObject = triggerStyle(true, false);
    const disabled: StyleObject = triggerStyle(true, true);

    expect(rest.border).toBe('1px solid #D0D4D8');
    expect(disabled.border).toBe('1px solid #D0D4D8');
    expect(disabled.borderColor).toBe('transparent');
    expect(disabled.backgroundColor).toBe('#E1E7EA');
    expect(rest.backgroundColor).toBe('#FFF');
    expect(rest.minHeight).toBe('3rem');
    expect(rest.height).toBeUndefined();
    expect(rest.padding).toBe('0.375rem 0.75rem 0.5rem 0.4375rem');
  });

  it('dims the name and the photo in the disabled recipe, in both branches', () => {
    const wired: StyleObject = triggerStyle(true, true);
    const staticCard: StyleObject = triggerStyle(false, true);

    expect(wired['& .ui-profile-select-card__name']).toEqual({ color: '#969B9D' });
    expect(wired['& .ui-profile-select-card__avatar']).toEqual({ opacity: 0.5 });
    expect(staticCard['& .ui-profile-select-card__avatar']).toEqual({ opacity: 0.5 });
    expect(staticCard.backgroundColor).toBe('#E1E7EA');
  });

  it('ships no transition anywhere, so nothing can animate', () => {
    const serialised: string = JSON.stringify([
      triggerStyle(true, false),
      triggerStyle(true, true),
      triggerStyle(false, false),
      menuItemSx,
      menuLayers(undefined),
      wrapperLayers(undefined),
    ]);

    expect(serialised).not.toMatch(/transition/);
    expect(serialised).not.toMatch(/animation/);
  });

  it('keeps the menu row at a 44px target with the hover fill under the ring', () => {
    const row: StyleObject = menuItemSx as StyleObject;
    const keys: string[] = Object.keys(row);

    expect(row.minHeight).toBe('2.75rem');
    expect(row['&:hover']).toEqual({ backgroundColor: '#f4f5f6' });
    expect(row['&:focus-visible']).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(keys.indexOf('&:focus-visible')).toBeGreaterThan(keys.indexOf('&:hover'));
    expect(row.overflowWrap).toBe('anywhere');
  });

  it('hangs the menu 11px below the trigger with a real border', () => {
    const base: StyleObject = menuLayers(undefined)[0];

    expect(base.position).toBe('absolute');
    expect(base.top).toBe('calc(100% + 0.6875rem)');
    expect(base.border).toBe('1px solid #D0D4D8');
    expect(base.zIndex).toBe(1);
    expect(wrapperLayers(undefined)[0]).toEqual({ position: 'relative', width: '100%' });
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(wrapperLayers(undefined)).toHaveLength(2);
    expect(wrapperLayers(undefined)[1]).toEqual({});
    expect(wrapperLayers({ marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: SxLayers = menuLayers([{ top: '1rem' }, { left: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ top: '1rem' });
    expect(layers[2]).toEqual({ left: '2rem' });
  });
});

describe('menu helpers — defensive branches', () => {
  it('does nothing when there is no menu element to search', () => {
    expect(() => focusMenuEnd(null, 'first')).not.toThrow();
    expect(() => focusMenuEnd(null, 'last')).not.toThrow();
    expect(() => moveMenuFocus(null, 1)).not.toThrow();
    expect(document.body).toHaveFocus();
  });

  it('treats a missing wrapper or a non-Node target as outside the widget', () => {
    expect(isInsideWidget(null, document.body)).toBe(false);
    expect(isInsideWidget(document.body, null)).toBe(false);
    expect(isInsideWidget(document.body, document.body)).toBe(true);
  });

  // The §4.4 sequence still has to report the action and request the close when
  // there is no mounted trigger to focus — the ref is null only between a
  // detach and the next attach, but the order must not depend on the focus call
  // succeeding.
  it('activates an item in order even with no trigger node to focus', () => {
    const refs: MenuFocusRefs = bareRefs();
    const requestOpen: jest.Mock = jest.fn();
    const onSelect: jest.Mock = jest.fn();
    const ctx: MenuFocusContext = { refs, open: true, requestOpen, onSelect };

    expect(() => activateMenuItem(ctx, 'logout')).not.toThrow();

    expect(onSelect).toHaveBeenCalledWith('logout');
    expect(requestOpen).toHaveBeenCalledWith(false);
    expect(refs.skipRescue.current).toBe(true);
    expect(document.body).toHaveFocus();
  });

  // React detaches a changed host ref in the mutation phase, BEFORE the parent's
  // layout-effect cleanup runs — so a consumer whose callback-ref identity
  // changes on the very render that closes the menu leaves the §4.6 rescue with
  // nothing to focus. It must degrade quietly rather than throw.
  it('survives a rescue with no trigger node left to rescue to', () => {
    const { rerender } = render(<RefChurningCard open tick={1} />);
    expect(itemNamed(PROFILE)).toHaveFocus();

    expect(() => rerender(<RefChurningCard open={false} tick={2} />)).not.toThrow();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toBeInTheDocument();
  });
});
