import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiChevronButton from '../../src/components/ui-chevron-button';
import chevronButtonWarning from '../../src/components/ui-chevron-button/chevron-button-warnings';
import { ChevronGlyph } from '../../src/components/ui-chevron-button/chevron-glyph';
import {
  CHEVRON_HOVER_SHADOW_TINT,
  FOCUS_RING,
  chevronButtonSx,
} from '../../src/components/ui-chevron-button/styles';
import type { UiChevronButtonProps } from '../../src/components/ui-chevron-button/types';

import {
  describeActivationRequests,
  describeAriaDisabledFocusable,
  describeButtonRoot,
  describeConsumerSx,
  describeFocusRingOrder,
  describeGlyphDecoration,
  describeNoAriaState,
  describeNoOpsWhileDisabled,
  describeRetainsFocusAcrossDisabledFlip,
  describeSilentInProduction,
  describeStaticBranch,
  describeStaticRefIsNull,
  describeSxLayerMerge,
  describeTabOrderAndRefs,
  describeWarnSequence,
  ruleAt,
  type ActivationOverrides,
  type SxLayers,
} from './utils/activation-control-contract';
import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { keysMatching, type StyleObject } from './utils/style-layers';

// UiChevronButton emits one dev-only accessible-name warning via console.warn.
// Silence it for the suite and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;
const LABEL: string = 'Наступна сторінка';

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here, which it cannot do if the expectation reads
// the same token as the implementation.
const WHITE: string = '#FFF';
const BRAND_GRAY: string = '#E1E7EA';
const GREY300: string = '#969B9D';
const DARK_PRIMARY: string = '#1A1C1E';

interface ButtonOverrides {
  label?: string | undefined;
  direction?: UiChevronButtonProps['direction'];
  onActivate?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  sx?: UiChevronButtonProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). The `in` check
// keeps the "runtime data violates the prop type" fixture — an absent label —
// expressible as an explicit `undefined`.
function buttonWith(extra: Readonly<ButtonOverrides>): React.ReactElement {
  const label: string = ('label' in extra ? extra.label : LABEL) as string;
  return (
    <UiChevronButton
      label={label}
      direction={extra.direction}
      onActivate={extra.onActivate}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

// The activation-control contract only ever varies `disabled`/`id`/`sx` for
// this control (chevron forwards no `lang`); `label` and `onActivate` stay
// this suite's own concern (see `buttonWith`).
function wiredWith(extra: Readonly<ActivationOverrides>): React.ReactElement {
  return buttonWith({ onActivate: noop, disabled: extra.disabled, id: extra.id, sx: extra.sx });
}

function staticWith(extra: Readonly<ActivationOverrides>): React.ReactElement {
  return buttonWith({ disabled: extra.disabled, id: extra.id, sx: extra.sx });
}

function withActivation(
  onActivate: (() => void) | undefined,
  extra: Readonly<ActivationOverrides>
): React.ReactElement {
  return buttonWith({ onActivate, disabled: extra.disabled, id: extra.id, sx: extra.sx });
}

function chevronButton(): HTMLElement {
  return screen.getByRole('button');
}

function layersOf(interactive: boolean, sx: UiChevronButtonProps['sx']): SxLayers {
  return chevronButtonSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return firstOf(layersOf(interactive, undefined));
}

// The behaviour every plain activation control in the toolkit shares — native
// button semantics, the aria-disabled boundary, tab-order/ref plumbing, the
// `sx` merge and the dev-warning shape — is asserted once in
// `activation-control-contract.tsx`. What follows below is what is TRUE OF
// THIS BUTTON ALONE: its content tree, its glyph geometry, its own palette.
const contract = {
  wiredWith,
  staticWith,
  withActivation,
  root: chevronButton,
  accessibleName: LABEL,
  component: UiChevronButton,
  expectedDisplayName: 'UiChevronButton',
  hasLang: false,
  warn,
  baseOf,
};

describe('UiChevronButton — root semantics', () => {
  describeButtonRoot(contract);
  describeNoAriaState(contract);
  describeGlyphDecoration(contract);
});

describe('UiChevronButton — static (unwired) button', () => {
  describeStaticBranch(contract);

  it('honours an explicit direction on the static branch too', () => {
    render(buttonWith({ direction: 'left' }));

    const pathEl: Element = firstOf(nodesMatching('svg path'));
    const path: string = pathEl.getAttribute('d') ?? '';
    expect(path).toBe('M12.5 5L7.5 10L12.5 15');
  });

  it('leaves aria-disabled off a disabled but UNWIRED button', () => {
    render(buttonWith({ disabled: true }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
  });
});

describe('UiChevronButton — activation', () => {
  describeActivationRequests(contract);
});

describe('UiChevronButton — disabled (aria-disabled boundary)', () => {
  describeAriaDisabledFocusable(contract);
  describeNoOpsWhileDisabled(contract);
  describeRetainsFocusAcrossDisabledFlip(contract);
});

describe('UiChevronButton — focus and refs', () => {
  describeTabOrderAndRefs({
    ...contract,
    tabOrderSiblings: (): React.ReactElement => (
      <div>
        <UiChevronButton label="Перша" onActivate={noop} />
        <UiChevronButton label="Статична" />
        <UiChevronButton label="Друга" onActivate={noop} />
      </div>
    ),
    firstName: 'Перша',
    secondName: 'Друга',
    withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
      <UiChevronButton ref={ref} label={LABEL} onActivate={noop} />
    ),
  });

  it('keeps focus on the button after activation — it never moves focus itself', async () => {
    const user: UserEvent = userEvent.setup();
    const onActivate: jest.Mock = jest.fn();
    render(withActivation(onActivate, {}));

    const root: HTMLElement = chevronButton();
    root.focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(root).toHaveFocus();
  });

  describeStaticRefIsNull(
    (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
      <UiChevronButton ref={ref} label={LABEL} />
    )
  );
});

describe('UiChevronButton — direction (visual only)', () => {
  it('defaults to right, matching the on-canvas Figma render', () => {
    render(buttonWith({ onActivate: noop }));

    const pathEl: Element = firstOf(nodesMatching('svg path'));
    const path: string = pathEl.getAttribute('d') ?? '';
    expect(path).toBe('M7.5 5L12.5 10L7.5 15');
  });

  it('flips to left on request', () => {
    render(buttonWith({ direction: 'left', onActivate: noop }));

    const pathEl: Element = firstOf(nodesMatching('svg path'));
    const path: string = pathEl.getAttribute('d') ?? '';
    expect(path).toBe('M12.5 5L7.5 10L12.5 15');
  });

  it('carries no aria-label, aria-labelledby or title beyond the button root', () => {
    render(buttonWith({ onActivate: noop }));

    expect(nodesMatching('[aria-labelledby], [title]')).toHaveLength(0);
    expect(nodesMatching('[aria-label]')).toHaveLength(1);
  });
});

describe('UiChevronButton — dev warnings', () => {
  describeWarnSequence(warn, 'stays silent for a healthy wired button and a healthy static one', [
    { render: (): React.ReactElement => wiredWith({}), expectedCallCount: 0 },
    { render: (): React.ReactElement => staticWith({}), expectedCallCount: 0 },
  ]);

  it('warns when the label is blank', () => {
    render(buttonWith({ label: '  ', onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns when the label is missing entirely', () => {
    render(buttonWith({ label: undefined, onActivate: noop }));

    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns on the static branch too — a nameless button is nameless either way', () => {
    render(buttonWith({ label: '' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  describeWarnSequence(warn, 'warns once per warning state, not once per render', [
    {
      render: (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ label: '   ', onActivate: noop }),
      expectedCallCount: 1,
    },
    {
      render: (): React.ReactElement => buttonWith({ onActivate: noop }),
      expectedCallCount: 1,
    },
  ]);

  describeSilentInProduction(warn, [
    (): React.ReactElement => buttonWith({ label: '', onActivate: noop }),
  ]);
});

describe('chevronButtonWarning — pure warning selector', () => {
  it('returns null for a healthy label', () => {
    expect(chevronButtonWarning({ label: LABEL })).toBeNull();
  });

  it('reports the blank-label warning for every blank, missing and whitespace form', () => {
    expect(chevronButtonWarning({ label: '' })).toContain('blank `label`');
    expect(chevronButtonWarning({ label: '   ' })).toContain('blank `label`');
    expect(chevronButtonWarning({} as UiChevronButtonProps)).toContain('blank `label`');
  });
});

describe('UiChevronButton — consumer sx', () => {
  describeConsumerSx(contract, {
    render: (sx): React.ReactElement => staticWith({ id: 'styled', sx }),
    target: (): Element => firstOf(nodesMatching('#styled')),
  });
});

describe('chevronButtonSx — style assembly (pure, mutation-killing)', () => {
  it('pins the 30x30 circle to the measured Figma geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('flex');
    expect(base.alignItems).toBe('center');
    expect(base.justifyContent).toBe('center');
    expect(base.width).toBe('1.875rem');
    expect(base.height).toBe('1.875rem');
    expect(base.padding).toBe(0);
    expect(base.margin).toBe(0);
    expect(base.borderRadius).toBe('50%');
    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.color).toBe(GREY300);
  });

  it('gates hover on the aria-disabled boundary and paints the Figma hover column', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[hoverKeys[0] as string]).toEqual({
      borderColor: GREY300,
      boxShadow: `0 4px 13px 0 ${CHEVRON_HOVER_SHADOW_TINT}`,
    });
  });

  it('gates :active on the same boundary — the hover border minus the shadow', () => {
    const base: StyleObject = baseOf(true);
    const activeKeys: string[] = keysMatching(base, ':active');

    expect(activeKeys).toEqual(['&:active:not([aria-disabled="true"])']);
    expect(base[activeKeys[0] as string]).toEqual({ borderColor: GREY300 });
  });

  it('pins the off-palette Figma hover shadow tint exactly', () => {
    expect(CHEVRON_HOVER_SHADOW_TINT).toBe('rgba(0, 0, 0, 0.25)');
  });

  it('paints the disabled column — brandGray fill, transparent border, default cursor', () => {
    const disabled: StyleObject = baseOf(true)['&[aria-disabled="true"]'] as StyleObject;

    expect(disabled).toEqual({
      backgroundColor: BRAND_GRAY,
      borderColor: 'transparent',
      cursor: 'default',
    });
  });

  it('ships the shared single-layer inset ring, verbatim', () => {
    expect(ruleAt(baseOf(true), ':focus-visible')).toEqual({
      outline: 'none',
      boxShadow: FOCUS_RING,
    });
    expect(FOCUS_RING).toBe(`inset 0 0 0 2px ${DARK_PRIMARY}`);
  });

  describeFocusRingOrder(
    () => baseOf(true),
    (keys: string[]): number => keys.indexOf('&:focus-visible')
  );

  it('adds cursor and appearance only to the wired branch', () => {
    expect(baseOf(true).cursor).toBe('pointer');
    expect(baseOf(true).appearance).toBe('none');
    expect(baseOf(false).cursor).toBeUndefined();
    expect(baseOf(false).appearance).toBeUndefined();
  });

  it('omits every button-only rule from the static branch, keeping the layout half', () => {
    const base: StyleObject = baseOf(false);

    expect(base['&[aria-disabled="true"]']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':active')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    // The layout half is identical, which is what makes both branches paint the
    // same rest presentation.
    expect(base.border).toBe(`1px solid ${BRAND_GRAY}`);
    expect(base.backgroundColor).toBe(WHITE);
    expect(base.borderRadius).toBe('50%');
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([baseOf(true), baseOf(false)]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  describeSxLayerMerge(layersOf);
});

describe('ChevronGlyph — the glyph (pure recipe)', () => {
  it('renders one decorative 20px svg whose stroke follows currentColor', () => {
    render(<ChevronGlyph direction="right" />);

    const svg: Element = firstOf(nodesMatching('svg'));
    const path: Element = firstOf(nodesMatching('svg path'));
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(nodesMatching('svg path')).toHaveLength(1);
    expect(path).toHaveAttribute('d', 'M7.5 5L12.5 10L7.5 15');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '1.67');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('renders the left path when direction is left', () => {
    render(<ChevronGlyph direction="left" />);

    const path: Element = firstOf(nodesMatching('svg path'));
    expect(path).toHaveAttribute('d', 'M12.5 5L7.5 10L12.5 15');
  });
});
