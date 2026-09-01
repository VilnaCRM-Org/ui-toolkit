import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiStatusBadge from '../../src/components/ui-status-badge';
import { CHECK_PATH, CheckGlyph } from '../../src/components/ui-status-badge/check-glyph';
import statusBadgeWarning from '../../src/components/ui-status-badge/status-badge-warnings';
import {
  ACTIVE_CHROME,
  BADGE_ROOT_CLASS,
  DISABLED_CHROME,
  HOVER_CHROME,
  REST_CHROME,
  statusBadgeSx,
  type StatusBadgeChrome,
} from '../../src/components/ui-status-badge/styles';
import type { UiStatusBadgeProps } from '../../src/components/ui-status-badge/types';
import {
  useStatusBadge,
  type StatusBadgeModel,
} from '../../src/components/ui-status-badge/use-status-badge';

import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';

// The badge has exactly ONE dev warning (a blank `label`); several tests drive it
// on purpose. Silence it for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The two label regimes (spec §5, `types.ts`). Interactive names are CONSTANT and
// state-free — `aria-pressed` carries the state; static names MUST name the state
// being painted, because a `role="img"` name is the whole non-visual signal.
const TOGGLE_LABEL: string = 'Виконано';
const DONE_LABEL: string = 'Завдання виконано';
const NOT_DONE_LABEL: string = 'Завдання не виконано';

// Palette literals, pinned rather than imported: a mutation that swaps a token has
// to change one of these strings to survive.
const WHITE: string = '#FFF';
const SUCCESS: string = '#38B386';
const BRAND_GRAY: string = '#E1E7EA';
const SUCCESS_TINT: string = 'rgba(56, 179, 134, 0.1)';
const FOCUS_RING: string = 'inset 0 0 0 2px #1A1C1E';
const HOVER_SELECTOR: string = '&:hover:not([aria-disabled="true"]):not([aria-pressed="true"])';
const RING_SELECTOR: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-pressed="true"])';

interface BadgeOverrides {
  label?: string | undefined;
  active?: boolean | undefined;
  onToggle?: () => void | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  sx?: UiStatusBadgeProps['sx'] | undefined;
}

// Props are applied one by one (the repo forbids JSX spreading). The `in` check
// keeps "runtime data violates the prop type" fixtures — an absent label —
// expressible as an explicit `undefined`.
function badgeWith(extra: Readonly<BadgeOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : TOGGLE_LABEL) as string;
  return (
    <UiStatusBadge
      label={label}
      active={extra.active}
      onToggle={extra.onToggle}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

function badge(): HTMLElement {
  return screen.getByRole('button');
}

function staticBadge(): HTMLElement {
  return screen.getByRole('img');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

function root(): Element {
  return firstOf(nodesMatching(`.${BADGE_ROOT_CLASS}`));
}

function glyph(): SVGElement {
  return document.querySelector('svg') as SVGElement;
}

// Every hook that would make something focusable. Exactly one match is allowed in
// the wired tree and zero in the static one (S2).
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

// Every ARIA/interactivity hook the static branch must not ship. `role` and
// `aria-label` are excluded because they ARE the static contract (the S2
// exception); `aria-hidden` is excluded because the decorative glyph carries it in
// both branches.
const FORBIDDEN_ARIA_SELECTOR: string =
  '[tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-selected], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls], ' +
  '[aria-setsize], [aria-posinset], [aria-required], [aria-invalid], [aria-live]';

// The static sweep is an allow-list, not a deny-list: anything the spec did not
// name has to fail here rather than slip through a forgotten selector.
function unexpectedAttributes(element: Element, allowed: readonly string[]): string[] {
  return element.getAttributeNames().filter((name: string): boolean => !allowed.includes(name));
}

// A bare `aria-live` container has no implicit role, so role queries alone leave a
// hole; sweep the attributes too (S9).
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

// `statusBadgeSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

interface LayerRequest {
  interactive: boolean;
  active: boolean;
  sx: UiStatusBadgeProps['sx'];
}

function layersOf(request: Readonly<LayerRequest>): SxLayers {
  return statusBadgeSx({
    interactive: request.interactive,
    active: request.active,
    sx: request.sx,
  }) as SxLayers;
}

function baseOf(interactive: boolean, active: boolean): StyleObject {
  return firstOf(layersOf({ interactive, active, sx: undefined }));
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

function indexOfKey(base: StyleObject, fragment: string): number {
  return Object.keys(base).findIndex((key: string) => key.includes(fragment));
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

function modelFor(props: UiStatusBadgeProps): StatusBadgeModel {
  return renderHook((): StatusBadgeModel => useStatusBadge(props)).result.current;
}

describe('UiStatusBadge — static mode (role="img", S2 exception / Ruling 4)', () => {
  it('renders a span with role="img" named by the label, and no button anywhere', () => {
    render(badgeWith({ label: NOT_DONE_LABEL }));

    const image: HTMLElement = staticBadge();
    expect(image.tagName).toBe('SPAN');
    expect(image).toHaveAttribute('role', 'img');
    expect(image).toHaveAccessibleName(NOT_DONE_LABEL);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('exposes zero focusable elements and zero ARIA beyond role + aria-label', () => {
    render(badgeWith({ label: NOT_DONE_LABEL }));

    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(FORBIDDEN_ARIA_SELECTOR)).toHaveLength(0);
    // The sweep is exact: `class` (the emotion + hook classes), `role` and
    // `aria-label` are the complete attribute set of a static badge.
    expect(unexpectedAttributes(staticBadge(), ['class', 'role', 'aria-label'])).toEqual([]);
  });

  it('renders the identical content tree, one aria-hidden glyph, plus the consumer id', () => {
    render(badgeWith({ label: DONE_LABEL, active: true, id: 'task-7-status' }));

    const image: HTMLElement = staticBadge();
    expect(image).toHaveAttribute('id', 'task-7-status');
    expect(image).toHaveClass(BADGE_ROOT_CLASS);
    expect(image.contains(glyph())).toBe(true);
    expect(nodesMatching('svg')).toHaveLength(1);
    expect(unexpectedAttributes(image, ['class', 'role', 'aria-label', 'id'])).toEqual([]);
  });

  it('paints the ACTIVE chrome for a static done badge (static + active is legal)', () => {
    const base: StyleObject = baseOf(false, true);

    expect(base.backgroundColor).toBe(SUCCESS);
    expect(base.borderColor).toBe(SUCCESS);
    expect(base.color).toBe(WHITE);
    // Painted through the base object, not an attribute selector: `aria-pressed`
    // is invalid on `role="img"`, so the ramp rung is applied directly and the
    // required NAME is the exposure channel instead.
    expect(keysMatching(base, 'aria-pressed')).toEqual([]);
  });

  it('never paints `disabled` on a static badge — nothing is interactive to disable', () => {
    render(badgeWith({ label: NOT_DONE_LABEL, disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(FORBIDDEN_ARIA_SELECTOR)).toHaveLength(0);
    expect(baseOf(false, false).backgroundColor).toBe(WHITE);
  });

  it('ignores a forwarded ref, because the static branch has no control to hand out', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiStatusBadge ref={ref} label={NOT_DONE_LABEL} />);

    expect(staticBadge()).toBeInTheDocument();
    expect(ref.current).toBeNull();
  });
});

describe('UiStatusBadge — interactive toggle semantics (S1/S2/S6)', () => {
  it('renders ONE native type="button" with aria-pressed and no explicit role', () => {
    render(badgeWith({ onToggle: noop }));

    const control: HTMLElement = badge();
    expect(control.tagName).toBe('BUTTON');
    expect(control).toHaveAttribute('type', 'button');
    expect(control).not.toHaveAttribute('role');
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(control).toHaveClass(BADGE_ROOT_CLASS);
  });

  it('mirrors `active` into aria-pressed across re-renders, coerced from nullish', () => {
    const { rerender } = render(badgeWith({ onToggle: noop }));
    expect(badge()).toHaveAttribute('aria-pressed', 'false');

    rerender(badgeWith({ active: true, onToggle: noop }));
    expect(badge()).toHaveAttribute('aria-pressed', 'true');

    rerender(badgeWith({ active: false, onToggle: noop }));
    expect(badge()).toHaveAttribute('aria-pressed', 'false');

    // Nullish coerces to `false` rather than dropping the attribute: an absent
    // aria-pressed would leave the toggle's state unexposed (S3).
    rerender(badgeWith({ active: undefined, onToggle: noop }));
    expect(badge()).toHaveAttribute('aria-pressed', 'false');
  });

  it('never ships role="switch", aria-checked or any radio/set metadata', () => {
    render(badgeWith({ active: true, onToggle: noop }));

    const control: HTMLElement = badge();
    // `aria-checked` is FORBIDDEN here: it would promise the mutual exclusivity of
    // a radio (the inverse of the 3.4 §1.1 ruling, from the same reasoning).
    expect(control.getAttributeNames()).not.toContain('aria-checked');
    expect(control).not.toHaveAttribute('aria-selected');
    expect(control).not.toHaveAttribute('aria-setsize');
    expect(control).not.toHaveAttribute('aria-posinset');
    expect(control).not.toHaveAttribute('aria-expanded');
    expect(control).not.toHaveAttribute('aria-haspopup');
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps exactly one focusable element and no nested control', () => {
    render(badgeWith({ onToggle: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(badge());
    expect(nodesMatching('input')).toHaveLength(0);
    expect(nodesMatching('[tabindex]')).toHaveLength(0);
  });

  it('renders the same aria-hidden glyph as the static branch, never an img role', () => {
    render(badgeWith({ onToggle: noop }));

    expect(glyph()).toHaveAttribute('aria-hidden', 'true');
    expect(glyph()).toHaveAttribute('focusable', 'false');
    expect(badge().contains(glyph())).toBe(true);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies the consumer id only when supplied', () => {
    const { rerender } = render(badgeWith({ onToggle: noop }));
    expect(badge()).not.toHaveAttribute('id');

    rerender(badgeWith({ id: 'task-9-status', onToggle: noop }));
    expect(badge()).toHaveAttribute('id', 'task-9-status');
  });

  it('exposes its display name', () => {
    expect(UiStatusBadge.displayName).toBe('UiStatusBadge');
  });
});

describe('UiStatusBadge — toggle requests (S3/S6)', () => {
  it('requests a toggle exactly once per click, with no payload', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ onToggle }));

    await user.click(badge());

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith();
  });

  it('requests a toggle exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ onToggle }));

    badge().focus();
    await user.keyboard('{Enter}');

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('requests a toggle exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ onToggle }));

    badge().focus();
    await user.keyboard(' ');

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('fires from the ACTIVE state too — a toggle is not a radio', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ active: true, onToggle }));

    await user.click(badge());
    badge().focus();
    await user.keyboard('{Enter} ');

    // The 3.4 "already in state" gate is deliberately absent: an active badge
    // activated again is a request to DEACTIVATE.
    expect(onToggle).toHaveBeenCalledTimes(3);
    expect(badge()).toHaveAttribute('aria-pressed', 'true');
  });

  it('ignores arrow, Home/End and printable keys — no roving model lives here', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ onToggle }));

    badge().focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}{Escape}a');

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('never self-flips the pressed state (always controlled, S3)', async () => {
    const user: UserEvent = userEvent.setup();
    render(badgeWith({ onToggle: noop }));

    await user.click(badge());

    expect(badge()).toHaveAttribute('aria-pressed', 'false');
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onToggle: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{badgeWith({ onToggle })}</form>);

    badge().focus();
    await user.keyboard('{Enter}');

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiStatusBadge — disabled (aria-disabled boundary, S4)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(badgeWith({ disabled: true, onToggle: noop }));

    const control: HTMLElement = badge();
    expect(control).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the badge
    // focusable while disabled (SC 2.4.3).
    expect(control.getAttributeNames()).not.toContain('disabled');
    expect(control).toBeEnabled();
    expect(control).toHaveAttribute('aria-pressed', 'false');
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(badgeWith({ disabled: true, onToggle: noop }));

    await user.tab();
    expect(badge()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ disabled: true, onToggle }));

    await user.click(badge());
    badge().focus();
    await user.keyboard('{Enter} ');

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('retains focus when a focused badge flips disabled, then resumes', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    const { rerender } = render(badgeWith({ onToggle }));

    const control: HTMLElement = badge();
    control.focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(badgeWith({ disabled: true, onToggle }));
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(control).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(badgeWith({ onToggle }));
    expect(control).not.toHaveAttribute('aria-disabled');
    expect(control).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('keeps the ACTIVE chrome on an active + disabled badge, as Figma draws it', () => {
    render(badgeWith({ active: true, disabled: true, onToggle: noop }));

    expect(badge()).toHaveAttribute('aria-pressed', 'true');
    expect(badge()).toHaveAttribute('aria-disabled', 'true');
    // The disabled rung carries the pressed negation, so the active fill wins.
    const base: StyleObject = baseOf(true, false);
    expect(base['&[aria-disabled="true"]:not([aria-pressed="true"])']).toEqual(DISABLED_CHROME);
    expect(base['&[aria-disabled="true"]']).toEqual({ cursor: 'default' });
  });
});

describe('UiStatusBadge — focus and tab order (S5)', () => {
  it('adds no tabindex: each wired badge is one tab stop, static ones are skipped', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div>
        <UiStatusBadge label="Перше" onToggle={noop} />
        <UiStatusBadge label={NOT_DONE_LABEL} />
        <UiStatusBadge label="Друге" active onToggle={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Перше' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Друге' })).toHaveFocus();
  });

  it('keeps focus on the badge after activation (the badge never moves focus)', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(badgeWith({ onToggle }));

    const control: HTMLElement = badge();
    control.focus();
    await user.keyboard('{Enter}');

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(control).toHaveFocus();
  });

  it('forwards an object ref to the badge button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiStatusBadge ref={ref} label={TOGGLE_LABEL} onToggle={noop} />);

    expect(ref.current).toBe(badge());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(
      <UiStatusBadge ref={collect} label={TOGGLE_LABEL} onToggle={noop} />
    );

    expect(seen[0]).toBe(badge());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('re-resolves the badge by id after a remount, the documented focus-return API', () => {
    const { unmount } = render(badgeWith({ id: 'status-7', onToggle: noop }));
    expect(badge()).toHaveAttribute('id', 'status-7');

    unmount();
    expect(nodesMatching('#status-7')).toHaveLength(0);

    render(badgeWith({ id: 'status-7', onToggle: noop }));
    const remounted: Element = firstOf(nodesMatching('#status-7'));
    expect(remounted).toBe(badge());
    (remounted as HTMLElement).focus();
    expect(remounted).toHaveFocus();
  });
});

describe('UiStatusBadge — accessible names and the two label regimes (S7)', () => {
  it('names the wired badge by aria-label alone, with no visible text and no title', () => {
    render(badgeWith({ onToggle: noop }));

    expect(badge()).toHaveAccessibleName(TOGGLE_LABEL);
    expect(badge()).toHaveAttribute('aria-label', TOGGLE_LABEL);
    expect(badge()).not.toHaveAttribute('title');
    // The badge is icon-only — the label never appears as visible text, which is
    // what makes a bare `aria-label` legal here (S7).
    expect(screen.queryByText(TOGGLE_LABEL)).not.toBeInTheDocument();
    expect(nodesMatching('[aria-labelledby]')).toHaveLength(0);
  });

  it('keeps the wired name CONSTANT across the state flip (aria-pressed carries state)', () => {
    const { rerender } = render(badgeWith({ onToggle: noop }));
    expect(badge()).toHaveAccessibleName(TOGGLE_LABEL);

    rerender(badgeWith({ active: true, onToggle: noop }));
    expect(badge()).toHaveAccessibleName(TOGGLE_LABEL);
    expect(badge()).toHaveAttribute('aria-pressed', 'true');
  });

  it('lets the static name carry the state, in both directions', () => {
    const { rerender } = render(badgeWith({ label: NOT_DONE_LABEL }));
    expect(staticBadge()).toHaveAccessibleName(NOT_DONE_LABEL);

    rerender(badgeWith({ label: DONE_LABEL, active: true }));
    expect(staticBadge()).toHaveAccessibleName(DONE_LABEL);
  });

  it('keeps sibling badges independently named', () => {
    render(
      <div>
        <UiStatusBadge label={DONE_LABEL} active />
        <UiStatusBadge label={TOGGLE_LABEL} onToggle={noop} />
      </div>
    );

    expect(screen.getByRole('img', { name: DONE_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TOGGLE_LABEL })).toBeInTheDocument();
  });
});

describe('UiStatusBadge — live-region prohibition (S9)', () => {
  it('exposes none across rest, active, disabled and active + disabled', () => {
    const { rerender } = render(badgeWith({ onToggle: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ active: true, onToggle: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ disabled: true, onToggle: noop }));
    expectNoLiveRegion();

    rerender(badgeWith({ active: true, disabled: true, onToggle: noop }));
    expectNoLiveRegion();
  });

  it('exposes none on a static badge, or after a real toggle', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    const { rerender } = render(badgeWith({ label: DONE_LABEL, active: true }));
    expectNoLiveRegion();

    rerender(badgeWith({ onToggle }));
    await user.click(badge());

    expect(onToggle).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });
});

describe('UiStatusBadge — dev warnings (S8)', () => {
  it('stays silent for a healthy wired badge', () => {
    render(badgeWith({ onToggle: noop }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays silent for a healthy static badge', () => {
    render(badgeWith({ label: NOT_DONE_LABEL }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('does NOT warn for `active` without `onToggle` — the deliberate 3.4 asymmetry', () => {
    render(badgeWith({ label: DONE_LABEL, active: true }));

    // Ruling 4: a static badge's required `role="img"` name IS the programmatic
    // exposure of the state, so nothing is painted that AT cannot read. Copying
    // 3.4's unwired-selected warning here would be a defect.
    expect(warn.spy).not.toHaveBeenCalled();
    expect(staticBadge()).toHaveAccessibleName(DONE_LABEL);
  });

  it('warns for a blank label on a wired badge', () => {
    render(badgeWith({ label: '   ', onToggle: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns for a blank label on a static badge', () => {
    render(badgeWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns for a label missing entirely', () => {
    render(badgeWith({ label: undefined, onToggle: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(badgeWith({ label: '   ', onToggle: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // `useDevWarning` is keyed on the message, so prop changes that stay inside the
    // SAME warning state stay quiet — the console is not a render log.
    rerender(badgeWith({ label: undefined, onToggle: noop }));
    rerender(badgeWith({ label: '', active: true, onToggle: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(badgeWith({ label: TOGGLE_LABEL, onToggle: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);
  });

  it('emits nothing in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(badgeWith({ label: '', onToggle: noop }));
      rerender(badgeWith({ label: '   ' }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('statusBadgeWarning — the only warning selector (pure)', () => {
  it('returns null for any label with content, in either mode', () => {
    expect(statusBadgeWarning({ label: TOGGLE_LABEL, onToggle: noop })).toBeNull();
    expect(statusBadgeWarning({ label: DONE_LABEL, active: true })).toBeNull();
    expect(statusBadgeWarning({ label: ' Виконано ' })).toBeNull();
  });

  it('reports a blank, whitespace-only or absent label with the guidance message', () => {
    const blank: string | null = statusBadgeWarning({ label: '' });

    expect(blank).toContain('blank `label`');
    expect(blank).toContain('nameless image');
    expect(blank).toContain('nameless button');
    expect(statusBadgeWarning({ label: '\t \n' })).toBe(blank);
    expect(statusBadgeWarning({ label: undefined as unknown as string })).toBe(blank);
  });
});

describe('UiStatusBadge — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(badgeWith({ sx: { marginTop: '1rem' }, onToggle: noop }));
    expect(badge()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(badgeWith({ label: NOT_DONE_LABEL, sx: [{ marginTop: '1rem' }, { opacity: 0.5 }] }));

    expect(root()).toHaveStyle({ marginTop: '1rem' });
    expect(root()).toHaveStyle({ opacity: '0.5' });
  });
});

describe('statusBadgeSx — style assembly (pure, mutation-killing)', () => {
  it('pins the 26px master box, the 50% radius and the always-on 2px border', () => {
    const base: StyleObject = baseOf(true, false);

    expect(base.width).toBe('1.625rem');
    expect(base.height).toBe('1.625rem');
    // J2: Figma records radius 54 on a 26px box; '50%' reproduces it exactly.
    expect(base.borderRadius).toBe('50%');
    // J1: the border is ALWAYS emitted, never conditionally added or removed.
    expect(base.borderWidth).toBe('2px');
    expect(base.borderStyle).toBe('solid');
    expect(base.border).toBeUndefined();
    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    expect(base.flexShrink).toBe(0);
    expect(base.alignItems).toBe('center');
    expect(base.justifyContent).toBe('center');
    expect(base.margin).toBe(0);
    expect(base.padding).toBe(0);
    // A circle cannot reflow, so this is the one Epic 3 surface with a fixed
    // `height`; the 26px box is also the whole hit area (SC 2.5.8).
    expect(base.minHeight).toBeUndefined();
  });

  it('pins the four state rungs to the Figma colours', () => {
    expect(REST_CHROME).toEqual({
      backgroundColor: WHITE,
      borderColor: BRAND_GRAY,
      color: BRAND_GRAY,
    });
    expect(HOVER_CHROME).toEqual({
      backgroundColor: SUCCESS_TINT,
      borderColor: SUCCESS,
      color: SUCCESS,
    });
    expect(ACTIVE_CHROME).toEqual({
      backgroundColor: SUCCESS,
      borderColor: SUCCESS,
      color: WHITE,
    });
    // Disabled derives from ACTIVE (solid fill + white check), desaturated — it
    // reads "done and frozen", never "empty".
    expect(DISABLED_CHROME).toEqual({
      backgroundColor: BRAND_GRAY,
      borderColor: BRAND_GRAY,
      color: WHITE,
    });
  });

  it('keeps every state delta COLOUR-ONLY: three keys per rung, no geometry', () => {
    const rungs: readonly StatusBadgeChrome[] = [
      REST_CHROME,
      HOVER_CHROME,
      ACTIVE_CHROME,
      DISABLED_CHROME,
    ];

    rungs.forEach((rung: StatusBadgeChrome): void => {
      expect(Object.keys(rung).sort()).toEqual(['backgroundColor', 'borderColor', 'color']);
    });
  });

  it('starts the interactive base from the REST rung', () => {
    const base: StyleObject = baseOf(true, false);

    expect(base.backgroundColor).toBe(WHITE);
    expect(base.borderColor).toBe(BRAND_GRAY);
    expect(base.color).toBe(BRAND_GRAY);
  });

  it('adds cursor, hover, pressed, disabled, ring and forced colors to the wired branch', () => {
    const base: StyleObject = baseOf(true, false);

    expect(base.cursor).toBe('pointer');
    expect(base.appearance).toBe('none');
    expect(base['&[aria-disabled="true"]']).toEqual({ cursor: 'default' });
    expect(base['&[aria-pressed="true"]']).toEqual(ACTIVE_CHROME);
    expect(base['@media (forced-colors: active)']).toEqual({
      // The SAME selector list as the ring rule, not a bare `:focus-visible`:
      // a media query adds no specificity, so the shorter selector would lose to
      // the ring's own `outline: none` and leave forced-colors users no indicator.
      [RING_SELECTOR]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('gates hover on BOTH the aria-disabled boundary and the pressed state', () => {
    const base: StyleObject = baseOf(true, false);

    // Hover is an intermediate tint between rest and active, so letting it win on
    // a pressed badge would visually DEMOTE it mid-flow.
    expect(keysMatching(base, ':hover')).toEqual([HOVER_SELECTOR]);
    expect(base['&:hover']).toBeUndefined();
    expect(base[HOVER_SELECTOR]).toEqual(HOVER_CHROME);
  });

  it('ships the ring as the Amendment A1 two-selector list with the pressed negation', () => {
    const base: StyleObject = baseOf(true, false);

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,4,0), so on a
    // badge that is focused AND hovered the hover tint would win and the ring would
    // vanish. The second selector repeats hover's negations to tie its specificity;
    // declared later, it wins. The bare one still covers the pressed and disabled
    // badges.
    expect(keysMatching(base, ':focus-visible')).toEqual([RING_SELECTOR]);
    expect(base[RING_SELECTOR]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
  });

  it('declares the ring AFTER every state rule so it wins at equal specificity', () => {
    const base: StyleObject = baseOf(true, false);
    const hover: number = indexOfKey(base, ':hover');
    const pressed: number = Object.keys(base).indexOf('&[aria-pressed="true"]');
    const disabled: number = Object.keys(base).indexOf(
      '&[aria-disabled="true"]:not([aria-pressed="true"])'
    );
    const ring: number = indexOfKey(base, ':focus-visible');

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(pressed).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(pressed);
    expect(ring).toBeGreaterThan(disabled);
  });

  it('omits every button-only rule from the static branch, in both active states', () => {
    const rest: StyleObject = baseOf(false, false);
    const done: StyleObject = baseOf(false, true);

    [rest, done].forEach((base: StyleObject): void => {
      expect(base.cursor).toBeUndefined();
      expect(base.appearance).toBeUndefined();
      expect(base['&[aria-disabled="true"]']).toBeUndefined();
      expect(base['&[aria-pressed="true"]']).toBeUndefined();
      expect(base['@media (forced-colors: active)']).toBeUndefined();
      expect(keysMatching(base, ':hover')).toEqual([]);
      expect(keysMatching(base, ':focus-visible')).toEqual([]);
      // The geometry half is identical, which is what makes the two branches paint
      // the same box (S2: both branches render an identical tree).
      expect(base.width).toBe('1.625rem');
      expect(base.borderWidth).toBe('2px');
      expect(base.borderRadius).toBe('50%');
    });
  });

  it('leaves a static REST badge on the rest rung and a static DONE badge on active', () => {
    expect(baseOf(false, false).backgroundColor).toBe(WHITE);
    expect(baseOf(false, false).color).toBe(BRAND_GRAY);
    expect(baseOf(false, true).backgroundColor).toBe(SUCCESS);
    expect(baseOf(false, true).color).toBe(WHITE);
  });

  it('ignores `active` on the wired branch, which paints through aria-pressed instead', () => {
    // The attribute selector is the only channel: a React-conditional style object
    // would let unexposed state be painted (the 3.4 mechanism).
    expect(baseOf(true, true)).toEqual(baseOf(true, false));
  });

  it('ships no transition and no animation, so nothing can move (S9)', () => {
    const serialised: string = JSON.stringify([
      baseOf(true, false),
      baseOf(false, false),
      baseOf(false, true),
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
    expect(serialised).not.toMatch(/opacity/i);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(layersOf({ interactive: true, active: false, sx: undefined })).toHaveLength(2);
    expect(layersOf({ interactive: true, active: false, sx: undefined })[1]).toEqual({});
    expect(layersOf({ interactive: true, active: false, sx: { marginTop: '1rem' } })[1]).toEqual({
      marginTop: '1rem',
    });

    const layers: SxLayers = layersOf({
      interactive: false,
      active: true,
      sx: [{ marginTop: '1rem' }, { marginLeft: '2rem' }],
    });
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ marginLeft: '2rem' });
  });

  it('pins the root class hook the showcase board forces the hover recipe through', () => {
    expect(BADGE_ROOT_CLASS).toBe('ui-status-badge__root');
  });
});

describe('CheckGlyph — the Figma check, at 1.6x the standard weight', () => {
  it('pins the normalised path exactly', () => {
    // Leaf points (13.3333, 4) -> (6, 11.3333) -> (2.6667, 8) in the 16px frame,
    // x1.5 into the 24 viewBox.
    expect(CHECK_PATH).toBe('M20 6L9 17L4 12');
  });

  it('renders one aria-hidden svg with the 16px box, the FULL 24 viewBox and stroke 3.2', () => {
    render(<CheckGlyph />);

    const svg: SVGElement = glyph();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    // Keeping the full viewBox is what reproduces Figma's ~0.33px optical lift.
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('strokes a single currentColor path with round caps and joins', () => {
    render(<CheckGlyph />);

    const paths: Element[] = nodesMatching('path');
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute('d', CHECK_PATH);
    // `currentColor` is what lets the root's `color` drive all four state colours
    // with no per-state SVG and no asset import.
    expect(paths[0]).toHaveAttribute('stroke', 'currentColor');
    expect(paths[0]).toHaveAttribute('stroke-width', '3.2');
    expect(paths[0]).toHaveAttribute('stroke-linecap', 'round');
    expect(paths[0]).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('is the same glyph in both branches, so no state changes the geometry', () => {
    const { rerender } = render(badgeWith({ label: DONE_LABEL, active: true }));
    expect(glyph()).toHaveAttribute('viewBox', '0 0 24 24');
    expect(firstOf(nodesMatching('path'))).toHaveAttribute('stroke-width', '3.2');

    rerender(badgeWith({ disabled: true, onToggle: noop }));
    expect(glyph()).toHaveAttribute('viewBox', '0 0 24 24');
    expect(firstOf(nodesMatching('path'))).toHaveAttribute('stroke-width', '3.2');
    expect(firstOf(nodesMatching('path'))).toHaveAttribute('d', CHECK_PATH);
  });
});

describe('useStatusBadge — badge view model', () => {
  it('marks an unwired badge non-interactive with no aria-pressed and no aria-disabled', () => {
    const model: StatusBadgeModel = modelFor({ label: NOT_DONE_LABEL });

    expect(model.interactive).toBe(false);
    expect(model.active).toBe(false);
    expect(model.ariaPressed).toBeUndefined();
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('still coerces `active` for an unwired badge, because the chrome reads it', () => {
    const model: StatusBadgeModel = modelFor({ label: DONE_LABEL, active: true });

    expect(model.active).toBe(true);
    expect(model.ariaPressed).toBeUndefined();
  });

  it('does not throw when an unwired badge is activated (no onToggle to call)', () => {
    const model: StatusBadgeModel = modelFor({ label: NOT_DONE_LABEL });
    expect((): void => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED badge', () => {
    const model: StatusBadgeModel = modelFor({ label: NOT_DONE_LABEL, disabled: true });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before any consumer code runs', () => {
    const onToggle: jest.Mock = jest.fn();
    const model: StatusBadgeModel = modelFor({
      label: TOGGLE_LABEL,
      disabled: true,
      onToggle,
    });

    model.onActivate();

    expect(onToggle).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
    expect(model.interactive).toBe(true);
  });

  it('reports a toggle from BOTH states — there is no already-in-state gate', () => {
    const onToggle: jest.Mock = jest.fn();
    const rest: StatusBadgeModel = modelFor({ label: TOGGLE_LABEL, onToggle });
    rest.onActivate();

    const done: StatusBadgeModel = modelFor({ label: TOGGLE_LABEL, active: true, onToggle });
    done.onActivate();

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(rest.ariaPressed).toBe(false);
    expect(done.ariaPressed).toBe(true);
    expect(done.ariaDisabled).toBeUndefined();
  });

  it('coerces a nullish `active` and a nullish `disabled` to false', () => {
    const model: StatusBadgeModel = modelFor({
      label: TOGGLE_LABEL,
      active: undefined,
      disabled: undefined,
      onToggle: noop,
    });

    expect(model.active).toBe(false);
    expect(model.ariaPressed).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });
});
