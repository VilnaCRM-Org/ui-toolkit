import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiTaskCard } from '../../src/components';
import { FOCUS_RING, taskCardSx } from '../../src/components/ui-task-card/styles';
import type { TaskAssignee } from '../../src/components/ui-task-card/types';
import { useTaskCard, type TaskCardModel } from '../../src/components/ui-task-card/use-task-card';

import mockConsoleWarn from './utils/mock-console-warn';

// UiTaskCard emits dev-only avatar guidance via console.warn; silence it for the
// suite and keep a handle for the assertions that check on it.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma sample card (literal strings preserved). Its accessible name is the
// content concatenation "{assignee} {title} {deadlineLabel} {deadline}" — the
// card carries no aria-label anywhere (a11y contract §2).
const ASSIGNEE_NAME: string = 'Евгения Маслова';
const TITLE: string = 'Подготовить бриф для заказчика @zakazchik';
const DEADLINE_LABEL: string = 'Дедлайн';
const DEADLINE: string = '12.09 15:00';
const ASSIGNEE: TaskAssignee = { name: ASSIGNEE_NAME, avatarSrc: '/evgeniya.png' };

const FULL_NAME: string = `${ASSIGNEE_NAME} ${TITLE} ${DEADLINE_LABEL} ${DEADLINE}`;
const UNASSIGNED_NAME: string = `${TITLE} ${DEADLINE_LABEL} ${DEADLINE}`;

// Runtime data (CMS/API) can violate the strict prop types; these fixtures model
// exactly that, which is what the dev-only backstops exist for.
const NO_SRC_ASSIGNEE: TaskAssignee = { name: ASSIGNEE_NAME } as unknown as TaskAssignee;
const NO_NAME_ASSIGNEE: TaskAssignee = { avatarSrc: '/evgeniya.png' } as unknown as TaskAssignee;

function renderCard(extra: Partial<React.ComponentProps<typeof UiTaskCard>> = {}): void {
  render(
    <UiTaskCard
      title={extra.title ?? TITLE}
      deadlineLabel={extra.deadlineLabel ?? DEADLINE_LABEL}
      deadline={extra.deadline ?? DEADLINE}
      assignee={'assignee' in extra ? extra.assignee : ASSIGNEE}
      onActivate={extra.onActivate}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

// The avatar carries no role (it is an `<img>` with a real alt, reached by role
// 'img'), but the "no photo at all" assertions need a node query.
function cardImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img'));
}

function tabbables(): Element[] {
  return Array.from(document.querySelectorAll('[tabindex]'));
}

function ariaDisabledNodes(): Element[] {
  return Array.from(document.querySelectorAll('[aria-disabled]'));
}

// Re-resolving a card by its `id` is exactly the focus-return flow a consumer
// runs once a dialog closes. `querySelectorAll` is the node query this repo's
// lint config permits (ui-item-row precedent), so it stands in for
// `getElementById` without a suppression.
function byId(id: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>(`#${id}`))[0];
}

// A bare `aria-live` container has no implicit role, so role queries alone leave
// a hole; sweep the attributes too (a11y contract §9).
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

// `taskCardSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type SxLayers = Record<string, unknown>[];
function layersOf(config: Parameters<typeof taskCardSx>[0]): SxLayers {
  return taskCardSx(config) as SxLayers;
}
function baseOf(interactive: boolean): Record<string, unknown> {
  return layersOf({ interactive, sx: undefined })[0];
}

describe('UiTaskCard — wired card semantics', () => {
  it('renders the whole card as one native type="button" named from its content', () => {
    renderCard({ onActivate: noop });

    const button: HTMLElement = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveAccessibleName(FULL_NAME);
  });

  it('renders exactly one button (no nested interactives)', () => {
    renderCard({ onActivate: noop });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('drops the assignee segment from the name when no assignee is given', () => {
    renderCard({ assignee: undefined, onActivate: noop });
    expect(screen.getByRole('button')).toHaveAccessibleName(UNASSIGNED_NAME);
  });

  it('exposes no disclosure, toggle or popup ARIA (activation is fire-and-forget)', () => {
    renderCard({ onActivate: noop });

    const button: HTMLElement = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-expanded');
    expect(button).not.toHaveAttribute('aria-controls');
    expect(button).not.toHaveAttribute('aria-pressed');
    expect(button).not.toHaveAttribute('aria-current');
    expect(button).not.toHaveAttribute('aria-haspopup');
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).not.toHaveAttribute('role');
  });

  it('applies lang only when the consumer supplies it', () => {
    const { rerender } = render(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={noop}
      />
    );
    expect(screen.getByRole('button')).not.toHaveAttribute('lang');

    rerender(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        lang="ru"
        onActivate={noop}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('lang', 'ru');
  });

  it('exposes its display name', () => {
    expect(UiTaskCard.displayName).toBe('UiTaskCard');
  });
});

describe('UiTaskCard — unwired static card', () => {
  it('is not a button yet keeps every piece of its text', () => {
    renderCard();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByText(DEADLINE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DEADLINE)).toBeInTheDocument();
  });

  it('exposes no tabindex and no aria-disabled anywhere in the tree', () => {
    renderCard({ disabled: true });

    expect(tabbables()).toHaveLength(0);
    expect(ariaDisabledNodes()).toHaveLength(0);
  });

  it('still renders the assignee photo with the very same alt text', () => {
    renderCard();
    expect(screen.getByRole('img')).toHaveAttribute('alt', ASSIGNEE_NAME);
  });
});

describe('UiTaskCard — keyboard activation', () => {
  it('activates with Enter exactly once', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ onActivate });

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('activates with Space exactly once', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ onActivate });

    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('ignores arrow, Home/End and printable keys (no key handlers at all)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ onActivate });

    screen.getByRole('button').focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}a');
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('never submits an enclosing form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onActivate: jest.Mock = jest.fn();
    render(
      <form onSubmit={onSubmit}>
        <UiTaskCard
          title={TITLE}
          deadlineLabel={DEADLINE_LABEL}
          deadline={DEADLINE}
          onActivate={onActivate}
        />
      </form>
    );

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('reaches every wired card in DOM order and skips the static ones', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiTaskCard
          title="First"
          deadlineLabel={DEADLINE_LABEL}
          deadline={DEADLINE}
          onActivate={noop}
        />
        <UiTaskCard title="Static" deadlineLabel={DEADLINE_LABEL} deadline={DEADLINE} />
        <UiTaskCard
          title="Second"
          deadlineLabel={DEADLINE_LABEL}
          deadline={DEADLINE}
          onActivate={noop}
        />
      </>
    );

    const first: HTMLElement = screen.getByRole('button', { name: /^First/ });
    const second: HTMLElement = screen.getByRole('button', { name: /^Second/ });

    await user.tab();
    expect(first).toHaveFocus();
    await user.tab();
    // The static card is not tabbable, so focus jumps straight to the second
    // wired card.
    expect(second).toHaveFocus();
  });

  it('adds no explicit tabindex to a wired card (native button order only)', () => {
    renderCard({ onActivate: noop });
    expect(tabbables()).toHaveLength(0);
  });
});

describe('UiTaskCard — disabled (aria-disabled boundary)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    renderCard({ disabled: true, onActivate: noop });

    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the card
    // focusable while disabled.
    expect(button.getAttributeNames()).not.toContain('disabled');
    expect(button).toBeEnabled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    renderCard({ disabled: true, onActivate: noop });

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('no-ops activation while disabled (onActivate never fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ disabled: true, onActivate });

    await user.click(screen.getByRole('button'));
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');

    expect(onActivate).not.toHaveBeenCalled();
  });

  it('retains focus when a focused card flips disabled, then restores activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    const { rerender } = render(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={onActivate}
      />
    );

    const button: HTMLElement = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    // The consumer flips the card to disabled while it holds focus: the
    // aria-disabled boundary (never native `disabled`) keeps the focus put
    // instead of dropping it to <body> (WCAG 2.4.3).
    rerender(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        disabled
        onActivate={onActivate}
      />
    );
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);

    // Re-enabling keeps focus AND restores activation.
    rerender(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={onActivate}
      />
    );
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('gates the hover recipe on the aria-disabled boundary and never ships a bare :hover', () => {
    const base: Record<string, unknown> = baseOf(true);

    expect(base['&:hover:not([aria-disabled="true"])']).toBeDefined();
    expect(base['&:hover']).toBeUndefined();
    expect(Object.keys(base).filter((key: string) => key.startsWith('&:hover'))).toEqual([
      '&:hover:not([aria-disabled="true"])',
    ]);
    expect(base['&[aria-disabled="true"]']).toEqual({ cursor: 'default' });
    expect(base.cursor).toBe('pointer');
  });
});

describe('UiTaskCard — focus-return API', () => {
  it('forwards the ref to the button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(
      <UiTaskCard
        ref={ref}
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={noop}
      />
    );

    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('puts the id on the button so focus can be re-resolved after a remount', () => {
    const { unmount } = render(
      <UiTaskCard
        id="task-7"
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={noop}
      />
    );
    expect(screen.getByRole('button')).toHaveAttribute('id', 'task-7');

    unmount();
    expect(byId('task-7')).toBeUndefined();

    render(
      <UiTaskCard
        id="task-7"
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={noop}
      />
    );
    const remounted: HTMLElement | undefined = byId('task-7');
    expect(remounted).toBe(screen.getByRole('button'));
    remounted?.focus();
    expect(remounted).toHaveFocus();
  });

  it('keeps focus on the card after activation (the card never moves focus itself)', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ onActivate });

    const button: HTMLElement = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(button).toHaveFocus();
  });
});

describe('UiTaskCard — assignee avatar', () => {
  it('paints a real informative 34px image named after the assignee', () => {
    renderCard({ onActivate: noop });

    const img: HTMLElement = screen.getByRole('img');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/evgeniya.png');
    expect(img).toHaveAttribute('alt', ASSIGNEE_NAME);
    expect(img).toHaveAttribute('width', '34');
    expect(img).toHaveAttribute('height', '34');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('never hides or re-labels the photo (it carries the assignee name)', () => {
    renderCard({ onActivate: noop });

    const img: HTMLElement = screen.getByRole('img');
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(img).not.toHaveAttribute('role');
    expect(img).not.toHaveAttribute('aria-label');
    expect(img).not.toHaveAttribute('title');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('accepts a static import object as the photo source', () => {
    renderCard({
      assignee: { name: ASSIGNEE_NAME, avatarSrc: { src: '/imported.png' } },
      onActivate: noop,
    });

    expect(screen.getByRole('img')).toHaveAttribute('src', '/imported.png');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('renders no photo and stays silent for an unassigned task', () => {
    renderCard({ assignee: undefined, onActivate: noop });

    expect(cardImages()).toHaveLength(0);
    expect(warn.spy).not.toHaveBeenCalled();
    // The track is still reserved, so titles left-align across the column.
    expect(baseOf(true).gridTemplateColumns).toBe('2.125rem 1fr');
    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('falls back to alt="" and warns when the assignee name is blank', () => {
    renderCard({ assignee: { name: '   ', avatarSrc: '/evgeniya.png' }, onActivate: noop });

    // An `alt=""` photo drops out of the accessibility tree, so it is reached by
    // node query rather than a role one.
    expect(cardImages()).toHaveLength(1);
    expect(cardImages()[0]).toHaveAttribute('alt', '');
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('with a blank `name`'));
  });

  it('falls back to alt="" and warns when the assignee name is missing entirely', () => {
    renderCard({ assignee: NO_NAME_ASSIGNEE, onActivate: noop });

    // An `alt=""` photo drops out of the accessibility tree, so it is reached by
    // node query rather than a role one.
    expect(cardImages()).toHaveLength(1);
    expect(cardImages()[0]).toHaveAttribute('alt', '');
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('with a blank `name`'));
  });

  it('renders no photo and warns when avatarSrc is missing', () => {
    renderCard({ assignee: NO_SRC_ASSIGNEE, onActivate: noop });

    expect(cardImages()).toHaveLength(0);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('without a usable `avatarSrc`'));
  });

  it('renders no photo and warns when avatarSrc is an empty string', () => {
    renderCard({ assignee: { name: ASSIGNEE_NAME, avatarSrc: '' }, onActivate: noop });

    expect(cardImages()).toHaveLength(0);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('without a usable `avatarSrc`'));
  });

  it('emits no warning in production even when the assignee is malformed', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      renderCard({ assignee: NO_SRC_ASSIGNEE, onActivate: noop });
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiTaskCard — deadline label and chip', () => {
  it('renders the chip as a plain, ARIA-free span', () => {
    renderCard({ onActivate: noop });

    const chip: HTMLElement = screen.getByText(DEADLINE);
    expect(chip.tagName).toBe('SPAN');
    expect(chip).not.toHaveAttribute('tabindex');
    expect(chip).not.toHaveAttribute('role');
    expect(chip).not.toHaveAttribute('title');
    expect(chip).not.toHaveAttribute('aria-hidden');
    expect(chip).not.toHaveAttribute('aria-label');
  });

  it('keeps the deadline label visible AND inside the accessible name', () => {
    renderCard({ onActivate: noop });

    const label: HTMLElement = screen.getByText(DEADLINE_LABEL);
    expect(label.tagName).toBe('SPAN');
    expect(label).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('button')).toHaveAccessibleName(FULL_NAME);
    expect(FULL_NAME).toContain(`${DEADLINE_LABEL} ${DEADLINE}`);
  });

  it('has exactly one button even though the chip sits inside it', () => {
    renderCard({ onActivate: noop });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('UiTaskCard — title', () => {
  const LONG_TITLE: string =
    'Подготовить бриф для заказчика ' +
    '@zakazchik-s-ochen-dlinnym-imenem-kotoroe-ne-perenositsya ' +
    'и ещё несколько слов, чтобы заголовок ' +
    'точно занял три строки в колонке доски';

  it('keeps a long title whole in the DOM and in the accessible name', () => {
    renderCard({ title: LONG_TITLE, onActivate: noop });

    expect(screen.getByText(LONG_TITLE)).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAccessibleName(
      `${ASSIGNEE_NAME} ${LONG_TITLE} ${DEADLINE_LABEL} ${DEADLINE}`
    );
  });

  it('is not a heading — the column heading belongs to the consumer', () => {
    renderCard({ title: LONG_TITLE, onActivate: noop });

    expect(screen.queryAllByRole('heading')).toHaveLength(0);
    expect(screen.getByText(LONG_TITLE).tagName).toBe('SPAN');
  });
});

describe('UiTaskCard — live-region prohibition', () => {
  it('exposes no live region before or after activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    renderCard({ onActivate });

    expectNoLiveRegion();
    await user.click(screen.getByRole('button'));
    expect(onActivate).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });

  it('exposes no live region when the deadline changes, and renames silently', () => {
    const { rerender } = render(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        assignee={ASSIGNEE}
        onActivate={noop}
      />
    );
    expectNoLiveRegion();

    rerender(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline="13.09 09:00"
        assignee={ASSIGNEE}
        onActivate={noop}
      />
    );

    expect(screen.getByRole('button')).toHaveAccessibleName(
      `${ASSIGNEE_NAME} ${TITLE} ${DEADLINE_LABEL} 13.09 09:00`
    );
    expectNoLiveRegion();
  });

  it('exposes no live region across a disabled flip', () => {
    const { rerender } = render(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        onActivate={noop}
      />
    );
    expectNoLiveRegion();

    rerender(
      <UiTaskCard
        title={TITLE}
        deadlineLabel={DEADLINE_LABEL}
        deadline={DEADLINE}
        disabled
        onActivate={noop}
      />
    );
    expectNoLiveRegion();
  });

  it('exposes no live region on a static card', () => {
    renderCard();
    expectNoLiveRegion();
  });
});

describe('taskCardSx — style assembly (pure, mutation-killing)', () => {
  it('pins the two-layer inset focus ring to the palette values', () => {
    expect(FOCUS_RING).toBe('inset 0 0 0 2px #1A1C1E, inset 0 0 0 4px #FFF');
    FOCUS_RING.split(', ').forEach((segment: string) => {
      expect(segment.startsWith('inset ')).toBe(true);
    });
  });

  it('adds cursor, the hover recipe and the focus ring only for the wired branch', () => {
    const interactive: Record<string, unknown> = baseOf(true);
    expect(interactive.appearance).toBe('none');
    expect(interactive['&:focus-visible']).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
    expect(interactive['&:hover:not([aria-disabled="true"])']).toEqual({
      '& .ui-task-card__title': { color: '#1A1C1E' },
      '& .ui-task-card__label': { color: '#404142' },
      '& .ui-task-card__chip': {
        backgroundColor: '#FFF',
        borderColor: '#E1E7EA',
        boxShadow: '0 4px 2px rgba(174, 181, 186, 0.25)',
      },
    });
  });

  it('omits every interactive rule for the static branch', () => {
    const staticBase: Record<string, unknown> = baseOf(false);
    expect(staticBase.cursor).toBeUndefined();
    expect(staticBase.appearance).toBeUndefined();
    expect(staticBase['&:focus-visible']).toBeUndefined();
    expect(staticBase['&:hover:not([aria-disabled="true"])']).toBeUndefined();
    expect(staticBase['@media (forced-colors: active)']).toBeUndefined();
  });

  it('keeps a forced-colors focus indicator drawn inside the card box', () => {
    expect(baseOf(true)['@media (forced-colors: active)']).toEqual({
      '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('ships no transition at all, so the focus ring can never animate', () => {
    const serialised: string = JSON.stringify([baseOf(true), baseOf(false)]);
    expect(baseOf(true).transition).toBeUndefined();
    expect(baseOf(false).transition).toBeUndefined();
    expect(serialised).not.toMatch(/transition/);
  });

  it('grows with its content: minHeight, never height, and no overflow', () => {
    const base: Record<string, unknown> = baseOf(true);
    expect(base.minHeight).toBe('5.875rem');
    expect(base.height).toBeUndefined();
    expect(base.overflow).toBeUndefined();
    expect(base.overflowX).toBeUndefined();
    expect(base.overflowY).toBeUndefined();
    expect(base.padding).toBe('0.875rem 1rem 0.8125rem');
    expect(base.scrollMarginBlock).toBe('0.5rem');
    expect(base.borderBottom).toBe('1px solid #E1E7EA');
    expect(base.backgroundColor).toBe('transparent');
  });

  it('appends an object sx after the base layer', () => {
    const layers: SxLayers = layersOf({ interactive: true, sx: { marginTop: '1rem' } });
    expect(layers).toHaveLength(2);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
  });

  it('spreads an array sx after the base layer', () => {
    const layers: SxLayers = layersOf({
      interactive: true,
      sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }],
    });
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ paddingTop: '2rem' });
  });

  it('leaves an empty consumer layer when no sx is supplied', () => {
    const layers: SxLayers = layersOf({ interactive: false, sx: undefined });
    expect(layers).toHaveLength(2);
    expect(layers[1]).toEqual({});
  });
});

describe('UiTaskCard — consumer sx', () => {
  it('applies an object sx to the card root', () => {
    renderCard({ sx: { marginTop: '1rem' }, onActivate: noop });
    expect(screen.getByRole('button')).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies an array sx to the card root', () => {
    renderCard({ sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }], onActivate: noop });

    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveStyle({ marginTop: '1rem' });
    expect(button).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('useTaskCard — card view model', () => {
  it('marks an unwired card non-interactive with no aria-disabled', () => {
    const { result } = renderHook(() =>
      useTaskCard({ title: TITLE, deadlineLabel: DEADLINE_LABEL, deadline: DEADLINE })
    );
    const model: TaskCardModel = result.current;
    expect(model.interactive).toBe(false);
    expect(model.disabled).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.avatar).toBeNull();
  });

  it('does not throw when an unwired card is activated (no onActivate to call)', () => {
    const { result } = renderHook(() =>
      useTaskCard({ title: TITLE, deadlineLabel: DEADLINE_LABEL, deadline: DEADLINE })
    );
    expect(() => result.current.onActivate()).not.toThrow();
  });

  it('fires onActivate once for a wired, enabled card', () => {
    const onActivate: jest.Mock = jest.fn();
    const { result } = renderHook(() =>
      useTaskCard({ title: TITLE, deadlineLabel: DEADLINE_LABEL, deadline: DEADLINE, onActivate })
    );
    result.current.onActivate();
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('swallows activation while disabled so onActivate never fires', () => {
    const onActivate: jest.Mock = jest.fn();
    const { result } = renderHook(() =>
      useTaskCard({
        title: TITLE,
        deadlineLabel: DEADLINE_LABEL,
        deadline: DEADLINE,
        disabled: true,
        onActivate,
      })
    );
    result.current.onActivate();
    expect(onActivate).not.toHaveBeenCalled();
    expect(result.current.ariaDisabled).toBe(true);
  });

  it('leaves aria-disabled off a disabled but UNWIRED card', () => {
    const { result } = renderHook(() =>
      useTaskCard({
        title: TITLE,
        deadlineLabel: DEADLINE_LABEL,
        deadline: DEADLINE,
        disabled: true,
      })
    );
    expect(result.current.disabled).toBe(true);
    expect(result.current.ariaDisabled).toBeUndefined();
  });

  it('resolves a string photo source into src + verbatim alt', () => {
    const { result } = renderHook(() =>
      useTaskCard({
        title: TITLE,
        deadlineLabel: DEADLINE_LABEL,
        deadline: DEADLINE,
        assignee: ASSIGNEE,
      })
    );
    expect(result.current.avatar).toEqual({ src: '/evgeniya.png', alt: ASSIGNEE_NAME });
  });

  it('resolves a static-import photo source through its `src` field', () => {
    const { result } = renderHook(() =>
      useTaskCard({
        title: TITLE,
        deadlineLabel: DEADLINE_LABEL,
        deadline: DEADLINE,
        assignee: { name: ASSIGNEE_NAME, avatarSrc: { src: '/imported.png' } },
      })
    );
    expect(result.current.avatar).toEqual({ src: '/imported.png', alt: ASSIGNEE_NAME });
  });
});
