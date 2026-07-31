import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiNotificationBadge } from '../../src/components';
import { BELL_PATH } from '../../src/components/ui-notification-badge/bell-glyph';
import badgeWarning from '../../src/components/ui-notification-badge/notification-badge-warnings';
import {
  DEFAULT_MAX,
  resolveCount,
  type NotificationCount,
} from '../../src/components/ui-notification-badge/notification-count';
import {
  DEFAULT_LABEL,
  notificationName,
} from '../../src/components/ui-notification-badge/notification-name';
import {
  COUNT_CLASS,
  FOCUS_RING,
  countChipSx,
  notificationBadgeSx,
} from '../../src/components/ui-notification-badge/styles';
import type { UiNotificationBadgeProps } from '../../src/components/ui-notification-badge/types';
import {
  useNotificationBadge,
  type NotificationBadgeModel,
} from '../../src/components/ui-notification-badge/use-notification-badge';

import mockConsoleWarn from './utils/mock-console-warn';

// UiNotificationBadge emits three dev-only warnings via console.warn for runtime
// data the strict prop types forbid. Silence them and keep a handle for the
// assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The built-in Ukrainian name stem (Ruling 7). Repeated as a literal rather than
// imported into the name assertions, so a mutated default cannot pass silently.
const LABEL: string = 'Сповіщення';

const MENU_ID: string = 'notification-panel';

// A consumer stem, standing in for the prose overrides the plural-free default
// format expects (Ruling 5).
const CUSTOM_LABEL: string = 'Пошта';

interface BadgeOverrides {
  count?: number;
  label?: string;
  max?: number;
  onActivate?: () => void;
  hasPopup?: 'menu';
  menuOpen?: boolean;
  menuId?: string;
  disabled?: boolean;
  id?: string;
  sx?: UiNotificationBadgeProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). The `in` check
// keeps an explicitly absent `count` — the shape runtime data produces — reachable.
function badgeWith(extra: Readonly<BadgeOverrides>): React.ReactElement {
  const count: number = ('count' in extra ? extra.count : 1) as number;
  return (
    <UiNotificationBadge
      count={count}
      label={extra.label}
      max={extra.max}
      onActivate={extra.onActivate}
      hasPopup={extra.hasPopup}
      menuOpen={extra.menuOpen}
      menuId={extra.menuId}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

function badge(): HTMLElement {
  return screen.getByRole('button');
}

// The accessible name is `aria-label` alone, so the raw attribute is what the
// containment assertions (SC 2.5.3) have to read.
function nameOf(): string {
  return badge().getAttribute('aria-label') as string;
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// The counter chip is `aria-hidden`, so it is reached by node query rather than by
// role — the integration-card decorative-node precedent.
function chips(): Element[] {
  return nodesMatching(`.${COUNT_CLASS}`);
}

function bells(): Element[] {
  return nodesMatching('svg');
}

// Every hook that would make something else in the badge focusable. Exactly one
// match is allowed in the wired tree and zero in the static one.
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

// Every ARIA/interactivity hook the static branch must not ship (S2). `aria-hidden`
// is excluded on purpose: the bell and the chip carry it in BOTH branches.
const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls], ' +
  '[aria-setsize], [aria-posinset], [aria-required], [aria-invalid]';

// A bare `aria-live` container has no implicit role, so role queries alone leave a
// hole; sweep the attributes too (the S9 prohibition).
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

// `notificationBadgeSx` is typed as the broad `SxProps` union; in practice it
// always returns the `[base, ...consumerSx]` array. Narrow it once here so the
// layer assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(interactive: boolean, sx: UiNotificationBadgeProps['sx']): SxLayers {
  return notificationBadgeSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return layersOf(interactive, undefined)[0];
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

function ruleAt(base: StyleObject, fragment: string): StyleObject {
  return base[keysMatching(base, fragment)[0]] as StyleObject;
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

const HOVER_KEY: string = '&:hover:not([aria-disabled="true"])';
const ACTIVE_KEY: string = '&:active:not([aria-disabled="true"]), &[aria-expanded="true"]';
const DISABLED_KEY: string = '&[aria-disabled="true"]';
const FOCUS_KEY: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

describe('UiNotificationBadge — wired button semantics (S1/S2/§6 role)', () => {
  it('renders the whole badge as ONE native type="button"', () => {
    render(badgeWith({ onActivate: noop }));

    const root: HTMLElement = badge();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    // The implicit button role is used — no redundant role attribute is invented.
    expect(root).not.toHaveAttribute('role');
    expect(root).toHaveAccessibleName(`${LABEL}: 1`);
  });

  it('keeps exactly one focusable element in the tree (the chip is never a control)', () => {
    render(badgeWith({ count: 4, onActivate: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(badge());
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(nodesMatching('input')).toHaveLength(0);
  });

  it('renders the bell as one decorative svg with the Figma stroke recipe', () => {
    render(badgeWith({ onActivate: noop }));

    expect(bells()).toHaveLength(1);
    const bell: Element = bells()[0];
    expect(bell).toHaveAttribute('aria-hidden', 'true');
    expect(bell).toHaveAttribute('focusable', 'false');
    expect(bell).toHaveAttribute('viewBox', '0 0 24 24');
    expect(bell).toHaveAttribute('width', '20');
    expect(bell).toHaveAttribute('height', '20');
    expect(bell).toHaveAttribute('fill', 'none');

    const paths: Element[] = nodesMatching('svg path');
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute('d', BELL_PATH);
    expect(paths[0]).toHaveAttribute('stroke', 'currentColor');
    expect(paths[0]).toHaveAttribute('stroke-width', '1.667');
    // Decorative in every state: the SVG is out of the accessibility tree, and the
    // button around it carries the whole name (S7).
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the counter as an aria-hidden span that carries the class hook', () => {
    render(badgeWith({ count: 4, onActivate: noop }));

    expect(chips()).toHaveLength(1);
    const chip: Element = chips()[0];
    expect(chip.tagName).toBe('SPAN');
    expect(chip).toHaveAttribute('aria-hidden', 'true');
    expect(chip).toHaveTextContent('4');
    expect(chip).not.toHaveAttribute('role');
    expect(chip).not.toHaveAttribute('tabindex');
    expect(COUNT_CLASS).toBe('ui-notification-badge__count');
  });

  it('applies the consumer id only when supplied, on the button itself', () => {
    const { rerender } = render(badgeWith({ onActivate: noop }));
    expect(badge()).not.toHaveAttribute('id');

    rerender(badgeWith({ id: 'bell-7', onActivate: noop }));
    expect(badge()).toHaveAttribute('id', 'bell-7');
    expect(nodesMatching('#bell-7')[0]).toBe(badge());
  });

  it('exposes its display name', () => {
    expect(UiNotificationBadge.displayName).toBe('UiNotificationBadge');
  });
});

describe('UiNotificationBadge — accessible name format (Ruling 5)', () => {
  it('names a quiet badge with the bare label and renders NO chip at all', () => {
    render(badgeWith({ count: 0, onActivate: noop }));

    expect(badge()).toHaveAccessibleName(LABEL);
    expect(badge()).toHaveAttribute('aria-label', LABEL);
    expect(chips()).toHaveLength(0);
    // The bell is still there: only the counter disappears.
    expect(bells()).toHaveLength(1);
  });

  it('names the counted badge "<label>: <display>" across the whole 0/1/9/10/99 sweep', () => {
    const { rerender } = render(badgeWith({ count: 1, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 1`);

    rerender(badgeWith({ count: 9, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 9`);
    expect(chips()[0]).toHaveTextContent('9');

    rerender(badgeWith({ count: 10, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 9+`);
    expect(chips()[0]).toHaveTextContent('9+');

    rerender(badgeWith({ count: 99, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 9+`);

    rerender(badgeWith({ count: 0, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(LABEL);
  });

  it('builds the name from the DISPLAY string, never the raw count (SC 2.5.3)', () => {
    render(badgeWith({ count: 42, onActivate: noop }));

    // A name saying "42" over a chip reading "9+" is a speech-input failure: the
    // visible text must be contained in the name.
    expect(badge()).toHaveAccessibleName(`${LABEL}: 9+`);
    expect(nameOf()).not.toContain('42');
    expect(chips()[0]).toHaveTextContent('9+');
    expect(nameOf()).toContain(chips()[0].textContent as string);
  });

  it('honours a custom cap on both channels', () => {
    const { rerender } = render(badgeWith({ count: 42, max: 99, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 42`);
    expect(chips()[0]).toHaveTextContent('42');

    rerender(badgeWith({ count: 100, max: 99, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 99+`);
    expect(chips()[0]).toHaveTextContent('99+');

    rerender(badgeWith({ count: 2, max: 1, onActivate: noop }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 1+`);
  });

  it('lets a consumer override the stem, with the same plural-free shape', () => {
    const { rerender } = render(
      badgeWith({ count: 3, label: 'Непрочитані листи', onActivate: noop })
    );
    expect(badge()).toHaveAccessibleName('Непрочитані листи: 3');

    rerender(badgeWith({ count: 0, label: 'Непрочитані листи', onActivate: noop }));
    expect(badge()).toHaveAccessibleName('Непрочитані листи');
  });

  it('carries the name on aria-label alone — never a title or a labelledby', () => {
    render(badgeWith({ count: 2, onActivate: noop }));

    expect(badge()).not.toHaveAttribute('title');
    expect(nodesMatching('[aria-labelledby], [aria-describedby]')).toHaveLength(0);
    expect(nodesMatching('[aria-label]')).toHaveLength(1);
  });
});

describe('UiNotificationBadge — count normalisation (dev backstop)', () => {
  it('floors a fractional count on both channels', () => {
    render(badgeWith({ count: 2.7, onActivate: noop }));

    expect(chips()[0]).toHaveTextContent('2');
    expect(badge()).toHaveAccessibleName(`${LABEL}: 2`);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('non-negative integer'));
  });

  it('normalises a negative count to a quiet badge', () => {
    render(badgeWith({ count: -1, onActivate: noop }));

    expect(chips()).toHaveLength(0);
    expect(badge()).toHaveAccessibleName(LABEL);
  });

  it('normalises every non-finite count to a quiet badge', () => {
    const { rerender } = render(badgeWith({ count: Number.NaN, onActivate: noop }));
    expect(chips()).toHaveLength(0);
    expect(badge()).toHaveAccessibleName(LABEL);

    rerender(badgeWith({ count: Number.POSITIVE_INFINITY, onActivate: noop }));
    expect(chips()).toHaveLength(0);

    rerender(badgeWith({ count: Number.NEGATIVE_INFINITY, onActivate: noop }));
    expect(chips()).toHaveLength(0);

    rerender(badgeWith({ count: undefined, onActivate: noop }));
    expect(chips()).toHaveLength(0);
    expect(badge()).toHaveAccessibleName(LABEL);
  });

  it('clamps an out-of-range cap to 1 rather than rendering "0+"', () => {
    const { rerender } = render(badgeWith({ count: 5, max: 0, onActivate: noop }));
    expect(chips()[0]).toHaveTextContent('1+');
    expect(badge()).toHaveAccessibleName(`${LABEL}: 1+`);

    rerender(badgeWith({ count: 5, max: -3, onActivate: noop }));
    expect(chips()[0]).toHaveTextContent('1+');

    rerender(badgeWith({ count: 5, max: Number.NaN, onActivate: noop }));
    expect(chips()[0]).toHaveTextContent('1+');
  });

  it('floors a fractional cap', () => {
    render(badgeWith({ count: 5, max: 2.9, onActivate: noop }));

    expect(chips()[0]).toHaveTextContent('2+');
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('positive integer'));
  });

  it('never lets the chip and the name disagree, whatever the input', () => {
    const counts: readonly number[] = [0, 1, 9, 10, 42, -1, 2.7, Number.NaN];

    counts.forEach((count: number): void => {
      const view = render(badgeWith({ count, onActivate: noop }));
      const label: string = nameOf();
      const chip: Element | undefined = chips()[0];

      if (chip == null) {
        expect(label).toBe(LABEL);
      } else {
        expect(label).toBe(`${LABEL}: ${chip.textContent as string}`);
      }
      view.unmount();
    });
  });
});

describe('UiNotificationBadge — popup passthrough', () => {
  it('emits none of the three attributes without hasPopup', () => {
    render(badgeWith({ onActivate: noop, menuOpen: true, menuId: MENU_ID }));

    const root: HTMLElement = badge();
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-controls');
  });

  it('emits aria-expanded in BOTH states once a popup is declared', () => {
    const { rerender } = render(badgeWith({ onActivate: noop, hasPopup: 'menu' }));

    expect(badge()).toHaveAttribute('aria-haspopup', 'menu');
    expect(badge()).toHaveAttribute('aria-expanded', 'false');

    rerender(badgeWith({ onActivate: noop, hasPopup: 'menu', menuOpen: true }));
    expect(badge()).toHaveAttribute('aria-expanded', 'true');

    rerender(badgeWith({ onActivate: noop, hasPopup: 'menu', menuOpen: false }));
    expect(badge()).toHaveAttribute('aria-expanded', 'false');
  });

  it('emits aria-controls ONLY while the menu is open, so no idref ever dangles', () => {
    const { rerender } = render(badgeWith({ onActivate: noop, hasPopup: 'menu', menuId: MENU_ID }));
    expect(badge()).not.toHaveAttribute('aria-controls');

    rerender(badgeWith({ onActivate: noop, hasPopup: 'menu', menuId: MENU_ID, menuOpen: true }));
    expect(badge()).toHaveAttribute('aria-controls', MENU_ID);

    rerender(badgeWith({ onActivate: noop, hasPopup: 'menu', menuId: MENU_ID, menuOpen: false }));
    expect(badge()).not.toHaveAttribute('aria-controls');
  });

  it('drops the whole channel on a static badge', () => {
    render(badgeWith({ hasPopup: 'menu', menuOpen: true, menuId: MENU_ID }));

    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });
});

describe('UiNotificationBadge — activation (S6/S3)', () => {
  it('requests the panel exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(badgeWith({ onActivate }));

    await user.click(badge());

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith();
  });

  it('fires exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(badgeWith({ onActivate }));

    badge().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('fires exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(badgeWith({ onActivate }));

    badge().focus();
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('ignores arrow, Home/End, Escape and printable keys', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(badgeWith({ onActivate }));

    badge().focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}{Escape}a');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{badgeWith({ onActivate })}</form>);

    badge().focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('never changes the count itself and never moves focus', async () => {
    const user: UserEvent = userEvent.setup();
    render(badgeWith({ count: 3, onActivate: noop }));

    const root: HTMLElement = badge();
    root.focus();
    await user.click(root);
    await user.keyboard('{Enter}');

    expect(chips()[0]).toHaveTextContent('3');
    expect(badge()).toHaveAccessibleName(`${LABEL}: 3`);
    expect(root).toHaveFocus();
  });
});

describe('UiNotificationBadge — disabled (aria-disabled boundary, S4)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(badgeWith({ disabled: true, onActivate: noop }));

    const root: HTMLElement = badge();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the badge
    // focusable while disabled (SC 2.4.3).
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
    expect(root.tagName).toBe('BUTTON');
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(badgeWith({ disabled: true, onActivate: noop }));

    await user.tab();
    expect(badge()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(badgeWith({ disabled: true, onActivate }));

    await user.click(badge());
    badge().focus();
    await user.keyboard('{Enter} ');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('retains focus when a focused badge flips disabled, then works again', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(badgeWith({ onActivate }));

    const root: HTMLElement = badge();
    root.focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(badgeWith({ disabled: true, onActivate }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    rerender(badgeWith({ onActivate }));
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('keeps the chip, the name and the popup channel while disabled', () => {
    render(
      badgeWith({
        count: 12,
        disabled: true,
        hasPopup: 'menu',
        menuOpen: true,
        menuId: MENU_ID,
        onActivate: noop,
      })
    );

    expect(chips()[0]).toHaveTextContent('9+');
    expect(badge()).toHaveAccessibleName(`${LABEL}: 9+`);
    expect(badge()).toHaveAttribute('aria-expanded', 'true');
    expect(badge()).toHaveAttribute('aria-controls', MENU_ID);
  });
});

describe('UiNotificationBadge — static (unwired) branch (S2)', () => {
  it('exposes zero focusable elements and zero ARIA hooks', () => {
    render(badgeWith({ count: 3 }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
    expect(nodesMatching('[aria-label]')).toHaveLength(0);
  });

  it('keeps the identical content tree on a div, including the consumer id', () => {
    render(badgeWith({ count: 3, id: 'static-bell' }));

    const root: Element = nodesMatching('#static-bell')[0];
    expect(root.tagName).toBe('DIV');
    expect(root.contains(bells()[0])).toBe(true);
    expect(root.contains(chips()[0])).toBe(true);
    expect(chips()[0]).toHaveTextContent('3');
    expect(chips()[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no chip at zero, exactly like the wired branch', () => {
    render(badgeWith({ count: 0 }));

    expect(chips()).toHaveLength(0);
    expect(bells()).toHaveLength(1);
  });

  it('shows no aria-disabled on a disabled static badge', () => {
    render(badgeWith({ count: 3, disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });
});

describe('UiNotificationBadge — focus and tab order', () => {
  it('adds no explicit tabindex, so every wired badge is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiNotificationBadge count={1} label="Перший" onActivate={noop} />
        <UiNotificationBadge count={2} label="Другий" />
        <UiNotificationBadge count={3} label="Третій" onActivate={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Перший: 1' })).toHaveFocus();
    // The static badge is skipped because it is not focusable at all.
    await user.tab();
    expect(screen.getByRole('button', { name: 'Третій: 3' })).toHaveFocus();
  });

  it('forwards an object ref to the button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiNotificationBadge ref={ref} count={1} onActivate={noop} />);

    expect(ref.current).toBe(badge());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const { unmount } = render(
      <UiNotificationBadge ref={collectorInto(seen)} count={1} onActivate={noop} />
    );

    expect(seen[0]).toBe(badge());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('re-resolves the badge by id after a remount, the documented focus-return API', () => {
    const { unmount } = render(badgeWith({ id: 'bell-7', onActivate: noop }));
    expect(badge()).toHaveAttribute('id', 'bell-7');

    unmount();
    expect(nodesMatching('#bell-7')).toHaveLength(0);

    render(badgeWith({ id: 'bell-7', onActivate: noop }));
    const remounted: Element = nodesMatching('#bell-7')[0];
    expect(remounted).toBe(badge());
    (remounted as HTMLElement).focus();
    expect(remounted).toHaveFocus();
  });
});

describe('UiNotificationBadge — live-region prohibition (S9, the headline clause)', () => {
  it('exposes none across quiet, counted, overflowing, expanded and disabled states', () => {
    const { rerender } = render(badgeWith({ count: 0, onActivate: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ count: 1, onActivate: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ count: 42, onActivate: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ count: 42, hasPopup: 'menu', menuOpen: true, onActivate: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ count: 42, disabled: true, onActivate: noop }));
    expectNoLiveRegion();
  });

  it('exposes none on a static badge, or after a real activation and a count change', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(badgeWith({ count: 3 }));
    expectNoLiveRegion();

    rerender(badgeWith({ count: 3, onActivate }));
    await user.click(badge());
    expect(onActivate).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();

    // The count changing is exactly the moment a live region would fire; the badge
    // just re-renders its `aria-label` instead.
    rerender(badgeWith({ count: 4, onActivate }));
    expect(badge()).toHaveAccessibleName(`${LABEL}: 4`);
    expectNoLiveRegion();
  });

  it('renders no aria-live attribute anywhere in either branch', () => {
    const { rerender } = render(badgeWith({ count: 5, onActivate: noop }));
    expect(nodesMatching('[aria-live]')).toHaveLength(0);
    expect(document.body.innerHTML).not.toContain('aria-live');

    rerender(badgeWith({ count: 5 }));
    expect(document.body.innerHTML).not.toContain('aria-live');
    expect(document.body.innerHTML).not.toContain('role="status"');
  });
});

describe('UiNotificationBadge — dev warnings', () => {
  it('stays silent for a healthy wired badge and a healthy static one', () => {
    const { rerender } = render(
      badgeWith({ count: 3, max: 99, label: CUSTOM_LABEL, onActivate: noop })
    );
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(badgeWith({ count: 0 }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a count that is not a non-negative integer', () => {
    const cases: readonly number[] = [-1, 2.5, Number.NaN, Number.POSITIVE_INFINITY];

    cases.forEach((count: number): void => {
      const view = render(badgeWith({ count, onActivate: noop }));
      expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('non-negative integer'));
      warn.spy.mockClear();
      view.unmount();
    });
  });

  it('warns for a cap below 1 or a fractional cap, and never for an omitted one', () => {
    const caps: readonly number[] = [0, -3, 1.5, Number.NaN];

    caps.forEach((max: number): void => {
      const view = render(badgeWith({ count: 5, max, onActivate: noop }));
      expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('positive integer'));
      warn.spy.mockClear();
      view.unmount();
    });

    render(badgeWith({ count: 5, onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a blank label override, which really does leave a nameless button', () => {
    const { unmount } = render(badgeWith({ label: '   ', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
    // The blank label is NOT repaired into the default — that would hide the bug.
    expect(badge()).toHaveAttribute('aria-label', '   : 1');

    unmount();
    warn.spy.mockClear();
    render(badgeWith({ label: '', onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));

    warn.spy.mockClear();
    render(badgeWith({ label: CUSTOM_LABEL, onActivate: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('reports the FIRST applicable warning only, count before max before label', () => {
    render(badgeWith({ count: -1, max: 0, label: '', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('non-negative integer'));
  });

  it('warns once per warning STATE, not once per render', () => {
    const { rerender } = render(badgeWith({ count: -1, onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // `useDevWarning` is keyed on the message, so a prop change landing in the SAME
    // warning state stays quiet — the console is not a render log.
    rerender(badgeWith({ count: Number.NaN, onActivate: noop }));
    rerender(badgeWith({ count: -5, disabled: true, onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(badgeWith({ count: 5, max: 0, onActivate: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('positive integer'));
  });

  it('emits nothing in production, for any of the three warnings', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(badgeWith({ count: -1, onActivate: noop }));
      rerender(badgeWith({ count: 1, max: 0, onActivate: noop }));
      rerender(badgeWith({ count: 1, label: ' ', onActivate: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiNotificationBadge — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(badgeWith({ sx: { marginTop: '1rem' }, onActivate: noop }));
    expect(badge()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(badgeWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { marginLeft: '2rem' }] }));

    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ marginLeft: '2rem' });
  });
});

describe('notificationBadgeSx — style assembly (pure, mutation-killing)', () => {
  it('pins the 48px circle to the measured master geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.width).toBe('3rem');
    expect(base.height).toBe('3rem');
    expect(base.borderRadius).toBe('50%');
    expect(base.boxSizing).toBe('border-box');
    expect(base.position).toBe('relative');
    expect(base.display).toBe('inline-flex');
    expect(base.alignItems).toBe('center');
    expect(base.justifyContent).toBe('center');
    expect(base.flexShrink).toBe(0);
    expect(base.margin).toBe(0);
    expect(base.padding).toBe(0);
    expect(base.font).toBe('inherit');
  });

  it('paints the rest column: bgGrey100 fill, the 1px grey400 stroke, grey300 bell', () => {
    const base: StyleObject = baseOf(true);

    expect(base.border).toBe('1px solid #D0D4D8');
    expect(base.backgroundColor).toBe('#FBFBFB');
    // The bell inherits this through `currentColor`, so one declaration recolours it.
    expect(base.color).toBe('#969B9D');
  });

  it('never clips: no overflow key exists in either branch', () => {
    // The chip overhangs the circle by 4px and by 2px more of ring when active, so
    // any clipping container would cut the counter off.
    expect(baseOf(true).overflow).toBeUndefined();
    expect(baseOf(false).overflow).toBeUndefined();
    expect(keysMatching(baseOf(true), 'overflow')).toEqual([]);
    expect((countChipSx as StyleObject).overflow).toBeUndefined();
  });

  it('gates hover on the aria-disabled boundary alone', () => {
    const base: StyleObject = baseOf(true);

    expect(keysMatching(base, ':hover')).toEqual([HOVER_KEY]);
    expect(base['&:hover']).toBeUndefined();
    expect(base[HOVER_KEY]).toEqual({
      backgroundColor: 'rgba(30, 174, 255, 0.1)',
      borderColor: 'transparent',
      color: '#1EAEFF',
    });
  });

  it('keys the active column off BOTH the pointer state and aria-expanded', () => {
    const base: StyleObject = baseOf(true);

    expect(keysMatching(base, ':active')).toEqual([ACTIVE_KEY]);
    expect(base[ACTIVE_KEY]).toEqual({
      backgroundColor: '#1EAEFF',
      borderColor: 'transparent',
      color: '#FFF',
      // The ring is an OUTSIDE stroke — a border would be drawn inside the 18px
      // box and shrink the chip. #FBFBFB, not #FFF: it is cut out of the page.
      [`& .${COUNT_CLASS}`]: { boxShadow: '0 0 0 2px #FBFBFB' },
    });
  });

  it('paints the disabled column and kills the pointer affordance', () => {
    expect(baseOf(true)[DISABLED_KEY]).toEqual({
      cursor: 'default',
      backgroundColor: '#E1E7EA',
      borderColor: 'transparent',
      color: '#D0D4D8',
      [`& .${COUNT_CLASS}`]: { backgroundColor: '#D0D4D8' },
    });
  });

  it('ships the Amendment A1 two-selector ring with the two-layer recipe', () => {
    const base: StyleObject = baseOf(true);

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,3,0), so on a
    // badge that is focused AND hovered the hover tint would win and the ring would
    // vanish. The second selector repeats hover's negation to tie it; declared
    // later, it wins. The bare one still covers the disabled badge.
    expect(keysMatching(base, ':focus-visible')).toEqual([FOCUS_KEY]);
    expect(base[FOCUS_KEY]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(FOCUS_RING).toBe('inset 0 0 0 2px #1A1C1E, inset 0 0 0 4px #FFF');
  });

  it('declares the ring AFTER hover, active and disabled, and disabled after active', () => {
    const keys: string[] = Object.keys(baseOf(true));
    const hover: number = keys.indexOf(HOVER_KEY);
    const active: number = keys.indexOf(ACTIVE_KEY);
    const disabled: number = keys.indexOf(DISABLED_KEY);
    const ring: number = keys.indexOf(FOCUS_KEY);

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(active).toBeGreaterThan(hover);
    // Equal specificity against `[aria-expanded="true"]`, so source order is what
    // makes a disabled + expanded badge read as disabled.
    expect(disabled).toBeGreaterThan(active);
    expect(ring).toBeGreaterThan(disabled);
  });

  it('adds the forced-colors fallback, since box-shadow is discarded there', () => {
    expect(baseOf(true)['@media (forced-colors: active)']).toEqual({
      '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);

    expect(base.border).toBe('1px solid #D0D4D8');
    [HOVER_KEY, ACTIVE_KEY, DISABLED_KEY].forEach((key: string): void => {
      const rule: StyleObject = base[key] as StyleObject;
      expect(rule.borderColor).toBe('transparent');
      expect(rule.border).toBeUndefined();
      expect(rule.borderWidth).toBeUndefined();
      expect(rule.width).toBeUndefined();
      expect(rule.height).toBeUndefined();
      expect(rule.padding).toBeUndefined();
    });
  });

  it('omits every button-only rule from the static branch, keeping the layout half', () => {
    const base: StyleObject = baseOf(false);

    expect(base.cursor).toBeUndefined();
    expect(base.appearance).toBeUndefined();
    expect(base[DISABLED_KEY]).toBeUndefined();
    expect(base['@media (forced-colors: active)']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':active')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    expect(keysMatching(base, 'aria-expanded')).toEqual([]);
    // The layout half is identical, which is what makes both branches paint the
    // same rest presentation.
    expect(base.border).toBe('1px solid #D0D4D8');
    expect(base.backgroundColor).toBe('#FBFBFB');
    expect(base.width).toBe('3rem');
  });

  it('adds cursor and appearance to the wired branch only', () => {
    expect(baseOf(true).cursor).toBe('pointer');
    expect(baseOf(true).appearance).toBe('none');
    expect(ruleAt(baseOf(true), ':hover').cursor).toBeUndefined();
  });

  it('ships no transition and no animation, so nothing can move (S9)', () => {
    const serialised: string = JSON.stringify([baseOf(true), baseOf(false), countChipSx]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(layersOf(true, undefined)).toHaveLength(2);
    expect(layersOf(true, undefined)[1]).toEqual({});
    expect(layersOf(true, { marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: SxLayers = layersOf(false, [{ marginTop: '1rem' }, { marginLeft: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ marginLeft: '2rem' });
  });
});

describe('countChipSx — the counter chip (pure, mutation-killing)', () => {
  it('anchors the 18px chip to the circle bottom-right with the 4px overhang', () => {
    const chip: StyleObject = countChipSx as StyleObject;

    expect(chip.position).toBe('absolute');
    // Offsets resolve against the PADDING box, which the root's permanent 1px
    // border pulls 1px inside the outer box Figma measures (x=34, y=30 in the 48px
    // frame). Both axes therefore compensate by that border width so the chip sits
    // 4px past the outer right edge and flush with the outer bottom.
    expect(chip.right).toBe('calc(-0.25rem - 1px)');
    expect(chip.bottom).toBe('-1px');
    expect(chip.width).toBe('1.125rem');
    expect(chip.height).toBe('1.125rem');
    expect(chip.borderRadius).toBe('50%');
    expect(chip.boxSizing).toBe('border-box');
    expect(chip.display).toBe('flex');
    expect(chip.alignItems).toBe('center');
    expect(chip.justifyContent).toBe('center');
    expect(chip.backgroundColor).toBe('#1EAEFF');
  });

  it('pins the counter ink to Inter Medium 12/18 with tracking killed', () => {
    const chip: StyleObject = countChipSx as StyleObject;

    expect(chip.fontFamily).toBe('Inter');
    expect(chip.fontWeight).toBe(500);
    expect(chip.fontSize).toBe('0.75rem');
    expect(chip.lineHeight).toBe('1.125rem');
    expect(chip.letterSpacing).toBe(0);
    // Always white: it must not inherit the root's per-state colour, which drives
    // the bell alone.
    expect(chip.color).toBe('#FFF');
  });
});

describe('resolveCount — counter arithmetic (pure)', () => {
  it('defaults the cap to the Figma 9 and passes a healthy count through', () => {
    expect(DEFAULT_MAX).toBe(9);
    expect(resolveCount({ count: 0, max: undefined })).toEqual({ count: 0, max: 9, display: '0' });
    expect(resolveCount({ count: 9, max: undefined })).toEqual({ count: 9, max: 9, display: '9' });
  });

  it('switches to the `${max}+` string strictly ABOVE the cap', () => {
    expect(resolveCount({ count: 10, max: undefined }).display).toBe('9+');
    expect(resolveCount({ count: 100, max: 99 }).display).toBe('99+');
    expect(resolveCount({ count: 99, max: 99 }).display).toBe('99');
  });

  it('normalises negative and non-finite counts to zero', () => {
    const cases: readonly number[] = [
      -1,
      -0.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    cases.forEach((count: number): void => {
      const resolved: NotificationCount = resolveCount({ count, max: undefined });
      expect(resolved.count).toBe(0);
      expect(resolved.display).toBe('0');
    });
  });

  it('floors a fractional count', () => {
    expect(resolveCount({ count: 2.9, max: undefined }).count).toBe(2);
    expect(resolveCount({ count: 0.9, max: undefined }).count).toBe(0);
  });

  it('clamps an out-of-range cap to 1 and floors a fractional one', () => {
    expect(resolveCount({ count: 5, max: 0 }).max).toBe(1);
    expect(resolveCount({ count: 5, max: -3 }).max).toBe(1);
    expect(resolveCount({ count: 5, max: Number.NaN }).max).toBe(1);
    expect(resolveCount({ count: 5, max: Number.POSITIVE_INFINITY }).max).toBe(1);
    expect(resolveCount({ count: 5, max: 2.9 }).max).toBe(2);
  });
});

describe('notificationName — name composition (pure)', () => {
  it('ships the Ukrainian default stem', () => {
    expect(DEFAULT_LABEL).toBe('Сповіщення');
  });

  it('returns the bare label at zero and the "label: display" form above it', () => {
    expect(notificationName({ label: undefined, count: 0, display: '0' })).toBe(LABEL);
    expect(notificationName({ label: undefined, count: 1, display: '1' })).toBe(`${LABEL}: 1`);
    expect(notificationName({ label: undefined, count: 42, display: '9+' })).toBe(`${LABEL}: 9+`);
  });

  it('uses the supplied label verbatim, blank overrides included', () => {
    expect(notificationName({ label: CUSTOM_LABEL, count: 2, display: '2' })).toBe('Пошта: 2');
    expect(notificationName({ label: '', count: 0, display: '0' })).toBe('');
  });

  it('bakes in no plural word in either branch', () => {
    const names: string[] = [1, 2, 5].map((count: number): string =>
      notificationName({ label: undefined, count, display: String(count) })
    );

    names.forEach((name: string): void => {
      expect(name).not.toMatch(/unread|непрочитан/i);
    });
  });
});

describe('notificationBadgeWarning — first-applicable selection (pure)', () => {
  it('returns null for healthy props, with and without the optional ones', () => {
    expect(badgeWarning({ count: 0 })).toBeNull();
    expect(badgeWarning({ count: 7, max: 99, label: CUSTOM_LABEL })).toBeNull();
  });

  it('reports the count problem ahead of everything else', () => {
    const message: string | null = badgeWarning({ count: -1, max: 0, label: '' });
    expect(message).toContain('non-negative integer');
  });

  it('reports the cap problem when the count is fine', () => {
    expect(badgeWarning({ count: 1, max: 0, label: '' })).toContain('positive integer');
  });

  it('reports the blank label last, and never for an omitted one', () => {
    expect(badgeWarning({ count: 1, label: '  ' })).toContain('blank `label`');
    expect(badgeWarning({ count: 1, label: undefined })).toBeNull();
  });
});

describe('useNotificationBadge — badge view model', () => {
  function modelFor(props: UiNotificationBadgeProps): NotificationBadgeModel {
    return renderHook((): NotificationBadgeModel => useNotificationBadge(props)).result.current;
  }

  it('marks an unwired badge non-interactive with no aria-disabled and no popup', () => {
    const model: NotificationBadgeModel = modelFor({ count: 3 });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.ariaHasPopup).toBeUndefined();
    expect(model.ariaExpanded).toBeUndefined();
    expect(model.ariaControls).toBeUndefined();
    expect(model.count).toBe(3);
    expect(model.display).toBe('3');
    expect(model.name).toBe(`${LABEL}: 3`);
  });

  it('does not throw when an unwired badge is activated (no onActivate to call)', () => {
    const model: NotificationBadgeModel = modelFor({ count: 3 });
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED badge (S2)', () => {
    const model: NotificationBadgeModel = modelFor({ count: 3, disabled: true });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before the callback is reached', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: NotificationBadgeModel = modelFor({ count: 3, disabled: true, onActivate });

    model.onActivate();

    expect(onActivate).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
  });

  it('reports activation once for a wired, enabled badge', () => {
    const onActivate: jest.Mock = jest.fn();
    const model: NotificationBadgeModel = modelFor({ count: 3, onActivate });

    model.onActivate();

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('coerces a nullish menuOpen to an explicit false once a popup is declared', () => {
    const model: NotificationBadgeModel = modelFor({
      count: 1,
      hasPopup: 'menu',
      menuId: MENU_ID,
      onActivate: noop,
    });

    expect(model.ariaHasPopup).toBe('menu');
    expect(model.ariaExpanded).toBe(false);
    expect(model.ariaControls).toBeUndefined();
  });

  it('emits aria-controls only alongside an open menu', () => {
    const open: NotificationBadgeModel = modelFor({
      count: 1,
      hasPopup: 'menu',
      menuOpen: true,
      menuId: MENU_ID,
      onActivate: noop,
    });

    expect(open.ariaExpanded).toBe(true);
    expect(open.ariaControls).toBe(MENU_ID);
  });

  it('drops the popup channel entirely on a static badge', () => {
    const model: NotificationBadgeModel = modelFor({
      count: 1,
      hasPopup: 'menu',
      menuOpen: true,
      menuId: MENU_ID,
    });

    expect(model.ariaHasPopup).toBeUndefined();
    expect(model.ariaExpanded).toBeUndefined();
    expect(model.ariaControls).toBeUndefined();
  });

  it('normalises the count and composes the name from the same display string', () => {
    const model: NotificationBadgeModel = modelFor({ count: 42.7, label: CUSTOM_LABEL });

    expect(model.count).toBe(42);
    expect(model.display).toBe('9+');
    expect(model.name).toBe('Пошта: 9+');
  });
});

describe('BellGlyph — the bell-01 mark', () => {
  it('re-joins the wrapped path on single spaces, with no line breaks left in it', () => {
    expect(BELL_PATH.startsWith('M9.3542 21.0001')).toBe(true);
    expect(BELL_PATH.endsWith('17.9999 8Z')).toBe(true);
    expect(BELL_PATH).not.toMatch(/\s{2}|\n/);
  });
});
