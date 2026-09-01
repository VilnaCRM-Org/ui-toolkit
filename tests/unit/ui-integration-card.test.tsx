import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiIntegrationCard } from '../../src/components';
import { resolveLogo } from '../../src/components/ui-integration-card/integration-logo';
import {
  GLYPH_CLASS,
  NAME_CLASS,
  headerRowSx,
  integrationCardSx,
  integrationLogoSx,
  nameSx,
  radioGlyphSx,
} from '../../src/components/ui-integration-card/styles';
import type {
  IntegrationLogo,
  UiIntegrationCardProps,
} from '../../src/components/ui-integration-card/types';
import useCardRef from '../../src/components/ui-integration-card/use-card-ref';
import {
  useIntegrationCard,
  type IntegrationCardModel,
} from '../../src/components/ui-integration-card/use-integration-card';

import mockConsoleWarn from './utils/mock-console-warn';

// UiIntegrationCard emits the four dev-only §12 warnings via console.warn — one of
// them (§12.2) on every wired card that mounts outside a `role="radiogroup"`, which
// is most of this suite. Silence them and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma masters, verbatim (Cards frame 439:19893) — capitalisation included:
// the card bakes in no literals of its own, so brand name and intrinsic mark size
// are consumer data (a11y contract §2.2/§3.5).
const HUBSPOT: string = 'Hubspot';
const AMOCRM: string = 'AmoCRM';
const HUBSPOT_LOGO: IntegrationLogo = { src: '/hubspot.png', width: 139, height: 40 };
const AMOCRM_LOGO: IntegrationLogo = { src: '/amocrm.png', width: 181, height: 52 };

// Runtime data (CMS/API) violates the strict prop types all the time; these
// fixtures model exactly that, which is what the dev-only backstops exist for.
const NO_SIZE_LOGO: IntegrationLogo = { src: '/hubspot.png' } as unknown as IntegrationLogo;

const LANDING_SHADOW: string = '0 8px 27px rgba(49, 59, 67, 0.14)';
const FOCUS_RING: string = 'inset 0 0 0 2px #1A1C1E';
// The Amendment-A1 two-selector ring list, shared by the ring rule and by the
// forced-colors fallback that has to tie its specificity.
const RING_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])';

interface CardOverrides {
  name?: string;
  logo?: IntegrationLogo;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: UiIntegrationCardProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks keep
// the "runtime data violates the prop type" fixtures — a missing name, an absent
// logo bundle — expressible as an explicit `undefined`.
function cardWith(extra: Readonly<CardOverrides>): React.ReactElement {
  const name: string = ('name' in extra ? extra.name : HUBSPOT) as string;
  const logo: IntegrationLogo = ('logo' in extra ? extra.logo : HUBSPOT_LOGO) as IntegrationLogo;
  return (
    <UiIntegrationCard
      name={name}
      logo={logo}
      selected={extra.selected}
      onSelect={extra.onSelect}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

// The consumer half of the §1.2 ownership split: the group, its roving model and
// its accessible name all belong outside the card. Wrapping suppresses the §12.2
// teaching warning, so the "stays silent" assertions can be exact.
function inGroup(node: React.ReactElement): React.ReactElement {
  return <div role="radiogroup">{node}</div>;
}

function card(): HTMLElement {
  return screen.getByRole('radio');
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// The logo is decorative (`alt=""`, §5.2), so it drops out of the accessibility
// tree and is reached by node query rather than by role — the task-card precedent.
function cardImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img'));
}

function glyph(): Element {
  return nodesMatching(`.${GLYPH_CLASS}`)[0];
}

// Every hook that would make something else in the card focusable. Exactly one
// match is allowed in the wired tree and zero in the static one (§2.4/§13.3).
const FOCUSABLE_SELECTOR: string =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]';

function focusables(): Element[] {
  return nodesMatching(FOCUSABLE_SELECTOR);
}

// Every ARIA/interactivity hook the static branch must not ship (§2.3/§6.2).
// `aria-hidden` is excluded on purpose: the decorative glyph carries it in both
// branches.
const ARIA_SELECTOR: string =
  '[role], [tabindex], [aria-checked], [aria-disabled], [aria-pressed], [aria-label], ' +
  '[aria-labelledby], [aria-describedby], [aria-haspopup], [aria-expanded], [aria-controls], ' +
  '[aria-setsize], [aria-posinset], [aria-required], [aria-invalid]';

// A bare `aria-live` container has no implicit role, so role queries alone leave a
// hole; sweep the attributes too (a11y contract §8.1).
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

// `integrationCardSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type StyleObject = Record<string, unknown>;
type SxLayers = StyleObject[];

function layersOf(interactive: boolean, sx: UiIntegrationCardProps['sx']): SxLayers {
  return integrationCardSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return layersOf(interactive, undefined)[0];
}

function keysMatching(base: StyleObject, fragment: string): string[] {
  return Object.keys(base).filter((key: string) => key.includes(fragment));
}

// Records every node the forwarded callback ref is handed, attach and detach.
function collectorInto(
  seen: (HTMLButtonElement | null)[]
): (node: HTMLButtonElement | null) => void {
  return (node: HTMLButtonElement | null): void => {
    seen.push(node);
  };
}

describe('UiIntegrationCard — wired radio semantics (§1.1/§2/§13.3)', () => {
  it('renders the whole card as one native type="button" with role="radio"', () => {
    render(cardWith({ onSelect: noop }));

    const root: HTMLElement = card();
    expect(root.tagName).toBe('BUTTON');
    expect(root).toHaveAttribute('type', 'button');
    expect(root).toHaveAttribute('role', 'radio');
    expect(root).toHaveAccessibleName(HUBSPOT);
  });

  it('carries a permanent aria-checked that mirrors `selected` across re-renders', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));

    expect(card()).toHaveAttribute('aria-checked', 'false');
    expect(card()).not.toBeChecked();

    rerender(cardWith({ selected: true, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'true');
    expect(card()).toBeChecked();

    rerender(cardWith({ selected: false, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'false');

    // Nullish coerces to `false` rather than dropping the attribute: an absent
    // aria-checked would leave the radio's state unexposed (§1.1/§3.1).
    rerender(cardWith({ selected: undefined, onSelect: noop }));
    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never ships aria-pressed, and never a self-rendered group or set metadata', () => {
    render(cardWith({ selected: true, onSelect: noop }));

    const root: HTMLElement = card();
    expect(root).not.toHaveAttribute('aria-pressed');
    expect(root).not.toHaveAttribute('aria-setsize');
    expect(root).not.toHaveAttribute('aria-posinset');
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root).not.toHaveAttribute('aria-haspopup');
    expect(root).not.toHaveAttribute('aria-selected');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('keeps exactly one focusable element in the tree (no nested interactive)', () => {
    render(cardWith({ onSelect: noop }));

    expect(focusables()).toHaveLength(1);
    expect(focusables()[0]).toBe(card());
    expect(screen.getAllByRole('radio')).toHaveLength(1);
    // No `<input type="radio">` and no MUI Radio: the glyph is paint (§1.3).
    expect(nodesMatching('input')).toHaveLength(0);
  });

  it('renders the glyph as an aria-hidden span that is never a control', () => {
    render(cardWith({ onSelect: noop }));

    const dot: Element = glyph();
    expect(dot.tagName).toBe('SPAN');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).not.toHaveAttribute('role');
    expect(dot).not.toHaveAttribute('tabindex');
    expect(nodesMatching(`.${GLYPH_CLASS}`)).toHaveLength(1);
  });

  it('renders the brand name as plain text, never a heading', () => {
    render(cardWith({ onSelect: noop }));

    const label: Element = nodesMatching(`.${NAME_CLASS}`)[0];
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveTextContent(HUBSPOT);
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
    expect(screen.getByText(HUBSPOT)).toBe(label);
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));

    expect(card()).not.toHaveAttribute('lang');
    expect(card()).not.toHaveAttribute('id');

    rerender(cardWith({ id: 'integration-hubspot', lang: 'en', onSelect: noop }));
    expect(card()).toHaveAttribute('id', 'integration-hubspot');
    expect(card()).toHaveAttribute('lang', 'en');
  });

  it('exposes its display name', () => {
    expect(UiIntegrationCard.displayName).toBe('UiIntegrationCard');
  });
});

describe('UiIntegrationCard — static (unwired) card (§2.3/§3.4/§13.5)', () => {
  it('exposes zero focusable elements and zero ARIA hooks', () => {
    render(cardWith({}));

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(focusables()).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });

  it('keeps the identical content tree, including the consumer id and lang', () => {
    render(cardWith({ id: 'static-card', lang: 'en' }));

    const root: Element = nodesMatching('#static-card')[0];
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('lang', 'en');
    expect(root.contains(glyph())).toBe(true);
    expect(cardImages()).toHaveLength(1);
    expect(screen.getByText(HUBSPOT)).toBeInTheDocument();
  });

  it('never paints the selected state, so no checked glyph outlives aria-checked', () => {
    render(cardWith({ selected: true }));

    // The selected chrome is keyed off `[aria-checked="true"]`, an attribute this
    // branch never has — the rest presentation is structural, not conditional.
    expect(nodesMatching('[aria-checked]')).toHaveLength(0);
    expect(baseOf(false)['&[aria-checked="true"]']).toBeUndefined();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('shows no aria-disabled on a disabled static card (§6.2)', () => {
    render(cardWith({ disabled: true }));

    expect(nodesMatching('[aria-disabled]')).toHaveLength(0);
    expect(nodesMatching(ARIA_SELECTOR)).toHaveLength(0);
  });
});

describe('UiIntegrationCard — selection requests (§3.2/§13.1/§13.2)', () => {
  it('requests selection exactly once per click', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    await user.click(card());

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith();
  });

  it('requests selection exactly once on Enter (no manual key handler double-fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('requests selection exactly once on Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('ignores arrow, Home/End and printable keys — no roving model lives here', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    card().focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Home}{End}{Escape}a');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('fires nothing when an already-selected card is activated by any gesture', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ selected: true, onSelect }));

    await user.click(card());
    card().focus();
    await user.keyboard('{Enter} ');

    // Native radio `change` semantics: a radio cannot unselect itself, and a
    // repeat selection must not re-run the consumer's side effects (§1.4/§3.2).
    expect(onSelect).not.toHaveBeenCalled();
    expect(card()).toBeChecked();
  });

  it('stays eligible after the consumer DECLINES the selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    await user.click(card());
    await user.click(card());
    card().focus();
    await user.keyboard('{Enter}');

    // `selected` stayed false (the consumer declined), so every later activation
    // is reported again — the gate is state, never a latch (§3.2).
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never self-flips the checked state (always controlled, §3.1)', async () => {
    const user: UserEvent = userEvent.setup();
    render(cardWith({ onSelect: noop }));

    await user.click(card());

    expect(card()).toHaveAttribute('aria-checked', 'false');
  });

  it('never submits an enclosing setup form on Enter (type="button")', async () => {
    const user: UserEvent = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    const onSelect: jest.Mock = jest.fn();
    render(<form onSubmit={onSubmit}>{cardWith({ onSelect })}</form>);

    card().focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('UiIntegrationCard — disabled (aria-disabled boundary, §6/§13.4)', () => {
  it('stays a focusable button with aria-disabled and no native disabled attribute', () => {
    render(cardWith({ disabled: true, onSelect: noop }));

    const root: HTMLElement = card();
    expect(root).toHaveAttribute('aria-disabled', 'true');
    // The native `disabled` attribute is NEVER set — that is what keeps the card
    // focusable while disabled (SC 2.4.3).
    expect(root.getAttributeNames()).not.toContain('disabled');
    expect(root).toBeEnabled();
    expect(root).toHaveAttribute('role', 'radio');
    expect(root).toHaveAttribute('aria-checked', 'false');
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(cardWith({ disabled: true, onSelect: noop }));

    await user.tab();
    expect(card()).toHaveFocus();
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ disabled: true, onSelect }));

    await user.click(card());
    card().focus();
    await user.keyboard('{Enter} ');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('retains focus when a focused card flips disabled, then restores selection', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({ onSelect }));

    const root: HTMLElement = card();
    root.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(cardWith({ disabled: true, onSelect }));
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).toHaveFocus();
    expect(document.body).not.toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);

    rerender(cardWith({ onSelect }));
    expect(root).not.toHaveAttribute('aria-disabled');
    expect(root).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('keeps the full selected chrome on a selected + disabled card (§6.3)', () => {
    render(cardWith({ selected: true, disabled: true, onSelect: noop }));

    // Figma ships no disabled master, so disabled invents zero visual changes:
    // both attributes are present and the selected recipe still applies.
    expect(card()).toHaveAttribute('aria-checked', 'true');
    expect(card()).toHaveAttribute('aria-disabled', 'true');
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('disabled'));
  });
});

describe('UiIntegrationCard — focus and tab order (§4.2/§4.3)', () => {
  it('adds no explicit tabindex, so every wired card is one native tab stop', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <div role="radiogroup">
        <UiIntegrationCard name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />
        <UiIntegrationCard name="Static" logo={AMOCRM_LOGO} />
        <UiIntegrationCard name={AMOCRM} logo={AMOCRM_LOGO} selected onSelect={noop} />
      </div>
    );

    expect(nodesMatching('[tabindex]')).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('radio', { name: HUBSPOT })).toHaveFocus();
    // No roving tabindex: the SELECTED sibling is an ordinary next stop, and the
    // static card is skipped because it is not focusable at all (§4.3).
    await user.tab();
    expect(screen.getByRole('radio', { name: AMOCRM })).toHaveFocus();
  });

  it('keeps focus on the card after activation (the card never moves focus)', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    render(cardWith({ onSelect }));

    const root: HTMLElement = card();
    root.focus();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(root).toHaveFocus();
  });

  it('forwards an object ref to the card button itself, never a wrapper', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    render(<UiIntegrationCard ref={ref} name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />);

    expect(ref.current).toBe(card());
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('forwards a callback ref to the same node and releases it on unmount', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const collect: (node: HTMLButtonElement | null) => void = collectorInto(seen);
    const { unmount } = render(
      <UiIntegrationCard ref={collect} name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />
    );

    expect(seen[0]).toBe(card());
    unmount();
    expect(seen[seen.length - 1]).toBeNull();
  });

  it('re-resolves the card by id after a remount, the documented focus-return API', () => {
    const { unmount } = render(cardWith({ id: 'integration-7', onSelect: noop }));
    expect(card()).toHaveAttribute('id', 'integration-7');

    unmount();
    expect(nodesMatching('#integration-7')).toHaveLength(0);

    render(cardWith({ id: 'integration-7', onSelect: noop }));
    const remounted: Element = nodesMatching('#integration-7')[0];
    expect(remounted).toBe(card());
    (remounted as HTMLElement).focus();
    expect(remounted).toHaveFocus();
  });
});

describe('UiIntegrationCard — accessible name and imagery (§5/§13.6)', () => {
  it('names the card with the brand name exactly, with no aria-label anywhere', () => {
    render(cardWith({ onSelect: noop }));

    expect(card()).toHaveAccessibleName(HUBSPOT);
    expect(nodesMatching('[aria-label], [aria-labelledby]')).toHaveLength(0);
    expect(card()).not.toHaveAttribute('title');
  });

  it('paints the logo as a decorative img with the full hygiene attribute set', () => {
    render(cardWith({ onSelect: noop }));

    const img: HTMLImageElement = cardImages()[0];
    expect(cardImages()).toHaveLength(1);
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/hubspot.png');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('width', '139');
    expect(img).toHaveAttribute('height', '40');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('draggable', 'false');
    // Selection cards are above-the-fold setup-flow content (§5.2).
    expect(img).not.toHaveAttribute('loading');
    expect(img).not.toHaveAttribute('onerror');
    expect(img).not.toHaveAttribute('title');
    // `alt=""` keeps it out of the accessibility tree entirely.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('accepts a static import object as the mark source', () => {
    render(cardWith({ logo: { src: { src: '/imported.png' }, width: 139, height: 40 } }));

    expect(cardImages()[0]).toHaveAttribute('src', '/imported.png');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('keeps the accessible name untouched by a second brand on the page', () => {
    render(
      <div role="radiogroup">
        <UiIntegrationCard name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />
        <UiIntegrationCard name={AMOCRM} logo={AMOCRM_LOGO} onSelect={noop} />
      </div>
    );

    expect(screen.getByRole('radio', { name: HUBSPOT })).toHaveAccessibleName(HUBSPOT);
    expect(screen.getByRole('radio', { name: AMOCRM })).toHaveAccessibleName(AMOCRM);
  });

  it('renders no img at all for an unusable logo bundle, keeping the geometry', () => {
    const { rerender } = render(cardWith({ logo: { src: '', width: 139, height: 40 } }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: { src: { src: '' }, width: 139, height: 40 } }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: NO_SIZE_LOGO }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: undefined }));
    expect(cardImages()).toHaveLength(0);
    // The card keeps its `minHeight` either way, so the row never collapses.
    expect(screen.getByText(HUBSPOT)).toBeInTheDocument();
    expect(baseOf(false).minHeight).toBe('8.875rem');
  });

  it('lets a long brand name wrap whole, with no clamp and no ellipsis', () => {
    const LONG: string = 'Hubspot Marketing Hub Enterprise Integration Connector';
    render(cardWith({ name: LONG, onSelect: noop }));

    expect(screen.getByText(LONG)).toBeInTheDocument();
    expect(card()).toHaveAccessibleName(LONG);
    expect((nameSx as StyleObject).textOverflow).toBeUndefined();
    expect((nameSx as StyleObject).whiteSpace).toBeUndefined();
    expect((nameSx as StyleObject).WebkitLineClamp).toBeUndefined();
    expect(baseOf(true).overflow).toBeUndefined();
  });
});

describe('UiIntegrationCard — live-region prohibition (§8.1/§13.7)', () => {
  it('exposes none across rest, selected, disabled and selected + disabled', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ selected: true, onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ disabled: true, onSelect: noop }));
    expectNoLiveRegion();

    rerender(cardWith({ selected: true, disabled: true, onSelect: noop }));
    expectNoLiveRegion();
  });

  it('exposes none on a static card, or after a real activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onSelect: jest.Mock = jest.fn();
    const { rerender } = render(cardWith({}));
    expectNoLiveRegion();

    rerender(cardWith({ onSelect }));
    await user.click(card());

    expect(onSelect).toHaveBeenCalledTimes(1);
    expectNoLiveRegion();
  });
});

describe('UiIntegrationCard — dev warnings (§12/§13.8)', () => {
  it('stays silent for a healthy wired card inside a radiogroup', () => {
    render(inGroup(cardWith({ onSelect: noop })));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays silent for a healthy static card', () => {
    render(cardWith({}));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when `selected` arrives without `onSelect` (§12.1)', () => {
    render(cardWith({ selected: true }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('stays silent for an explicitly unselected static card', () => {
    render(cardWith({ selected: false }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns for a whitespace-only name (§12.3)', () => {
    render(inGroup(cardWith({ name: '   ', onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns for a name missing entirely (§12.3)', () => {
    render(inGroup(cardWith({ name: undefined, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('warns once per warning state, not once per render', () => {
    const { rerender } = render(inGroup(cardWith({ name: '   ', onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // `useDevWarning` is keyed on the message, so a prop change that lands in the
    // SAME warning state stays quiet — a blank name and an absent one are one
    // state, and the console is not a render log.
    rerender(inGroup(cardWith({ name: undefined, onSelect: noop })));
    rerender(inGroup(cardWith({ name: '', selected: false, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    // A change INTO a different warning state does re-report.
    rerender(inGroup(cardWith({ logo: NO_SIZE_LOGO, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledTimes(2);
    expect(warn.spy).toHaveBeenLastCalledWith(expect.stringContaining('usable `src`'));
  });

  it('warns for an unusable logo bundle (§12.4)', () => {
    render(inGroup(cardWith({ logo: NO_SIZE_LOGO, onSelect: noop })));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('usable `src`'));
  });

  it('reports the unwired-selected misconfiguration ahead of the content ones', () => {
    render(cardWith({ name: '', selected: true }));

    // One warning per render, most structural first: fixing the wiring is what
    // makes the state representable at all (§12).
    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('static content'));
  });

  it('emits nothing in production, for any of the four warnings', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { rerender } = render(cardWith({ name: '', selected: true }));
      rerender(cardWith({ name: '', logo: NO_SIZE_LOGO, onSelect: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiIntegrationCard — radiogroup context warning (§12.2/§13.9)', () => {
  it('warns once for a standalone wired card', () => {
    render(cardWith({ onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('[role="radiogroup"]'));
  });

  it('does not warn for a wired card wrapped in a radiogroup', () => {
    render(inGroup(cardWith({ onSelect: noop })));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('never warns for a static card, wrapped or not', () => {
    const { rerender } = render(cardWith({}));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(inGroup(cardWith({})));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('does not re-warn on an ordinary re-render', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));
    expect(warn.spy).toHaveBeenCalledTimes(1);

    rerender(cardWith({ selected: true, onSelect: noop }));
    rerender(cardWith({ selected: true, disabled: true, onSelect: noop }));

    expect(warn.spy).toHaveBeenCalledTimes(1);
  });

  it('stays silent in production', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(cardWith({ onSelect: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiIntegrationCard — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(cardWith({ sx: { marginTop: '1rem' }, onSelect: noop }));
    expect(card()).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(cardWith({ id: 'styled', sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] }));

    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('integrationCardSx — style assembly (pure, mutation-killing)', () => {
  it('pins the card box to the measured master geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.border).toBe('1px solid #E1E7EA');
    expect(base.borderRadius).toBe('0.75rem');
    expect(base.backgroundColor).toBe('#FFF');
    expect(base.width).toBe('100%');
    // Fluid height: a `minHeight`, never a `height`, so the name may wrap at 200%
    // zoom without shearing (§10.1).
    expect(base.minHeight).toBe('8.875rem');
    expect(base.height).toBeUndefined();
    expect(base.padding).toBe('0.90625rem 0.9375rem 0.9375rem');
    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('flex');
    expect(base.flexDirection).toBe('column');
    expect(base.textAlign).toBe('left');
    expect(base.font).toBe('inherit');
  });

  it('adds cursor, hover, selected, ring and forced colors only to the wired branch', () => {
    const base: StyleObject = baseOf(true);

    expect(base.cursor).toBe('pointer');
    expect(base.appearance).toBe('none');
    expect(base['&[aria-disabled="true"]']).toEqual({ cursor: 'default' });
    expect(base['@media (forced-colors: active)']).toEqual({
      // The SAME selector list as the ring rule, not a bare `:focus-visible`: a
      // media query adds no specificity, so the shorter selector would lose to the
      // ring's own `outline: none` and leave forced-colors users no indicator.
      [RING_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('gates hover on BOTH the aria-disabled boundary and the checked state (§7.4)', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual(['&:hover:not([aria-disabled="true"]):not([aria-checked="true"])']);
    expect(base['&:hover']).toBeUndefined();
    expect(base[hoverKeys[0]]).toEqual({
      borderColor: '#D0D4D8',
      boxShadow: LANDING_SHADOW,
    });
  });

  it('paints the selected chrome and the 5px checked glyph off aria-checked', () => {
    expect(baseOf(true)['&[aria-checked="true"]']).toEqual({
      borderColor: '#1EAEFF',
      boxShadow: LANDING_SHADOW,
      [`& .${GLYPH_CLASS}`]: { border: '5px solid #1EAEFF' },
    });
  });

  it('declares the inset ring after BOTH the hover and selected rules (§7.1)', () => {
    const keys: string[] = Object.keys(baseOf(true));
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const checked: number = keys.indexOf('&[aria-checked="true"]');
    const ring: number = keys.findIndex((key: string) => key.includes(':focus-visible'));

    expect(hover).toBeGreaterThanOrEqual(0);
    expect(checked).toBeGreaterThan(hover);
    expect(ring).toBeGreaterThan(checked);
  });

  it('ships the ring as a two-selector list so hover can never outrank it', () => {
    const base: StyleObject = baseOf(true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,4,0), so on a
    // card that is focused AND hovered the Landing shadow would win and the ring
    // would vanish. The second selector repeats hover's negations to tie its
    // specificity; declared later, it wins. The bare one still covers the disabled
    // and selected cards.
    expect(ringKeys).toEqual([RING_SELECTORS]);
    expect(RING_SELECTORS).toBe(
      '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])'
    );
    expect(base[ringKeys[0]]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
  });

  it('omits every button-only rule from the static branch', () => {
    const base: StyleObject = baseOf(false);

    expect(base.cursor).toBeUndefined();
    expect(base.appearance).toBeUndefined();
    expect(base['&[aria-disabled="true"]']).toBeUndefined();
    expect(base['@media (forced-colors: active)']).toBeUndefined();
    expect(keysMatching(base, ':hover')).toEqual([]);
    expect(keysMatching(base, ':focus-visible')).toEqual([]);
    // The layout half is identical, which is what makes the two branches paint
    // the same rest presentation (§2.2).
    expect(base.border).toBe('1px solid #E1E7EA');
    expect(base.borderRadius).toBe('0.75rem');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);
    const hover: StyleObject = base[keysMatching(base, ':hover')[0]] as StyleObject;
    const checked: StyleObject = base['&[aria-checked="true"]'] as StyleObject;

    expect(base.border).toBe('1px solid #E1E7EA');
    expect(hover.border).toBeUndefined();
    expect(hover.borderWidth).toBeUndefined();
    expect(checked.border).toBeUndefined();
    expect(checked.borderWidth).toBeUndefined();
  });

  it('ships no transition and no animation, so nothing can move (§9.1)', () => {
    const serialised: string = JSON.stringify([
      baseOf(true),
      baseOf(false),
      headerRowSx,
      radioGlyphSx,
      nameSx,
      integrationLogoSx(40),
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(layersOf(true, undefined)).toHaveLength(2);
    expect(layersOf(true, undefined)[1]).toEqual({});
    expect(layersOf(true, { marginTop: '1rem' })[1]).toEqual({ marginTop: '1rem' });

    const layers: SxLayers = layersOf(false, [{ marginTop: '1rem' }, { paddingTop: '2rem' }]);
    expect(layers).toHaveLength(3);
    expect(layers[1]).toEqual({ marginTop: '1rem' });
    expect(layers[2]).toEqual({ paddingTop: '2rem' });
  });
});

describe('integration-card styles — content recipes (pure, mutation-killing)', () => {
  it('reproduces the ui-radio-group dot recipe exactly (§1.3)', () => {
    const dot: StyleObject = radioGlyphSx as StyleObject;

    expect(dot.width).toBe('1.25rem');
    expect(dot.height).toBe('1.25rem');
    expect(dot.borderRadius).toBe('50%');
    expect(dot.boxSizing).toBe('border-box');
    expect(dot.backgroundColor).toBe('#FFF');
    expect(dot.border).toBe('1px solid #D0D4D8');
    // 3px down, so the glyph centres on the FIRST 26px text line and stays put
    // when a long brand name wraps (§10.2).
    expect(dot.marginTop).toBe('0.1875rem');
    expect(dot.flexShrink).toBe(0);
  });

  it('aligns the header row to the first text line with the master 9px gap', () => {
    const row: StyleObject = headerRowSx as StyleObject;

    expect(row.display).toBe('flex');
    expect(row.alignItems).toBe('flex-start');
    expect(row.gap).toBe('0.5625rem');
  });

  it('pins the brand name to Golos Text Regular 16/26 with tracking killed', () => {
    const label: StyleObject = nameSx as StyleObject;

    expect(label.fontFamily).toBe("'Golos Text'");
    expect(label.fontWeight).toBe(400);
    expect(label.fontSize).toBe('1rem');
    expect(label.lineHeight).toBe('1.625rem');
    expect(label.letterSpacing).toBe(0);
    expect(label.color).toBe('#1A1C1E');
    expect(label.overflowWrap).toBe('anywhere');
  });

  it('places each mark by the master rule and keeps it centred and scalable', () => {
    const hubspot: StyleObject = integrationLogoSx(40) as StyleObject;
    const amocrm: StyleObject = integrationLogoSx(52) as StyleObject;

    // logoTop = (142 - h/2)/2 measured from the outer edge, expressed as the gap
    // below the 26px header line: 20px for HubSpot, 17px for AmoCRM.
    expect(hubspot.marginTop).toBe('1.25rem');
    expect(amocrm.marginTop).toBe('1.0625rem');
    expect(hubspot.marginLeft).toBe('auto');
    expect(hubspot.marginRight).toBe('auto');
    expect(hubspot.display).toBe('block');
    // Narrow consumer widths scale the mark instead of shearing it (§10.2).
    expect(hubspot.maxWidth).toBe('100%');
    expect(hubspot.height).toBe('auto');
  });

  it('floors the logo gap at zero so an oversized mark cannot ride up into the name', () => {
    expect((integrationLogoSx(200) as StyleObject).marginTop).toBe('0rem');
    expect((integrationLogoSx(120) as StyleObject).marginTop).toBe('0rem');
  });
});

describe('resolveLogo — bundle resolution (§3.5)', () => {
  it('accepts a URL string and a static import alike', () => {
    expect(resolveLogo({ src: '/hubspot.png', width: 139, height: 40 })).toEqual({
      src: '/hubspot.png',
      width: 139,
      height: 40,
    });
    expect(resolveLogo({ src: { src: '/imported.png' }, width: 181, height: 52 })).toEqual({
      src: '/imported.png',
      width: 181,
      height: 52,
    });
  });

  it('rejects a blank, nullish or absent source', () => {
    expect(resolveLogo({ src: '', width: 139, height: 40 })).toBeNull();
    expect(resolveLogo({ src: { src: '' }, width: 139, height: 40 })).toBeNull();
    expect(resolveLogo(undefined)).toBeNull();
    expect(resolveLogo({ width: 139, height: 40 } as unknown as IntegrationLogo)).toBeNull();
  });

  it('rejects any dimension that cannot reproduce the master geometry', () => {
    const cases: readonly IntegrationLogo[] = [
      { src: '/x.png', width: 0, height: 40 },
      { src: '/x.png', width: 139, height: 0 },
      { src: '/x.png', width: -139, height: 40 },
      { src: '/x.png', width: Number.NaN, height: 40 },
      { src: '/x.png', width: Number.POSITIVE_INFINITY, height: 40 },
      { src: '/x.png', height: 40 } as unknown as IntegrationLogo,
      { src: '/x.png', width: 139 } as unknown as IntegrationLogo,
    ];

    cases.forEach((logo: IntegrationLogo): void => {
      expect(resolveLogo(logo)).toBeNull();
    });
  });
});

describe('useIntegrationCard — card view model', () => {
  function modelFor(props: UiIntegrationCardProps): IntegrationCardModel {
    return renderHook((): IntegrationCardModel => useIntegrationCard(props, null)).result.current;
  }

  it('marks an unwired card non-interactive with no aria-disabled', () => {
    const model: IntegrationCardModel = modelFor({ name: HUBSPOT, logo: HUBSPOT_LOGO });

    expect(model.interactive).toBe(false);
    expect(model.ariaChecked).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.logo).toEqual({ src: '/hubspot.png', width: 139, height: 40 });
  });

  it('does not throw when an unwired card is activated (no onSelect to call)', () => {
    const model: IntegrationCardModel = modelFor({ name: HUBSPOT, logo: HUBSPOT_LOGO });
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED card (§6.2)', () => {
    const model: IntegrationCardModel = modelFor({
      name: HUBSPOT,
      logo: HUBSPOT_LOGO,
      disabled: true,
    });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('swallows activation while disabled, before any model work', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: IntegrationCardModel = modelFor({
      name: HUBSPOT,
      logo: HUBSPOT_LOGO,
      disabled: true,
      onSelect,
    });

    model.onActivate();

    expect(onSelect).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
  });

  it('swallows activation on an already-selected card', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: IntegrationCardModel = modelFor({
      name: HUBSPOT,
      logo: HUBSPOT_LOGO,
      selected: true,
      onSelect,
    });

    model.onActivate();

    expect(onSelect).not.toHaveBeenCalled();
    expect(model.ariaChecked).toBe(true);
  });

  it('reports selection once for a wired, enabled, unselected card', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: IntegrationCardModel = modelFor({
      name: HUBSPOT,
      logo: HUBSPOT_LOGO,
      onSelect,
    });

    model.onActivate();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('resolves an unusable bundle to a null logo rather than a broken img', () => {
    expect(modelFor({ name: HUBSPOT, logo: NO_SIZE_LOGO }).logo).toBeNull();
  });
});

describe('useCardRef — ref plumbing and the §12.2 mount check', () => {
  it('feeds a forwarded callback ref', () => {
    const seen: (HTMLButtonElement | null)[] = [];
    const node: HTMLButtonElement = document.createElement('button');
    const { result } = renderHook(() => useCardRef(collectorInto(seen), false));

    result.current(node);
    result.current(null);

    expect(seen).toEqual([node, null]);
  });

  it('feeds a forwarded ref object', () => {
    const node: HTMLButtonElement = document.createElement('button');
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    const { result } = renderHook(() => useCardRef(ref, false));

    result.current(node);
    expect(ref.current).toBe(node);

    result.current(null);
    expect(ref.current).toBeNull();
  });

  it('keeps its private handle when the consumer forwards nothing', () => {
    // The common case: no consumer ref at all. The handle is still kept, because
    // the §12.2 mount check is what reads it.
    const node: HTMLButtonElement = document.createElement('button');
    const { result } = renderHook(() => useCardRef(null, false));

    expect(() => result.current(node)).not.toThrow();
  });

  it('keeps the callback identity stable while the forwarded ref does not change', () => {
    const ref: React.RefObject<HTMLButtonElement | null> = React.createRef<HTMLButtonElement>();
    const { result, rerender } = renderHook(() => useCardRef(ref, true));
    const first: React.RefCallback<HTMLButtonElement> = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('warns when a wired card has no node to check against, and stays quiet unwired', () => {
    // The card button always mounts in the real component, so this exercises the
    // hook's own guard: with no node the ancestor cannot be proven, and §12.2
    // teaches rather than gates.
    renderHook(() => useCardRef(null, true));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('[role="radiogroup"]'));

    warn.spy.mockClear();
    renderHook(() => useCardRef(null, false));
    expect(warn.spy).not.toHaveBeenCalled();
  });
});
