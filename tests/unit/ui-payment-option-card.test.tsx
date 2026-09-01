import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';

import type { IntegrationLogo } from '../../src/components/ui-integration-card/types';
import UiPaymentOptionCard from '../../src/components/ui-payment-option-card';
import {
  resolvePaymentLogo,
  resolvePaymentMark,
} from '../../src/components/ui-payment-option-card/payment-logo';
import {
  CIRCLE_CLASS,
  LOGO_CLASS,
  paymentLogoSx,
  paymentOptionCardSx,
  selectionCircleSx,
} from '../../src/components/ui-payment-option-card/styles';
import type { UiPaymentOptionCardProps } from '../../src/components/ui-payment-option-card/types';
import {
  usePaymentCard,
  type PaymentCardModel,
} from '../../src/components/ui-payment-option-card/use-payment-card';
import usePaymentCardRef from '../../src/components/ui-payment-option-card/use-payment-card-ref';

import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { describeRadioCardContract, describeRadioCardRefHook } from './utils/radio-card-contract';
import { keysMatching, type StyleObject, type SxLayers } from './utils/style-layers';

// UiPaymentOptionCard emits the four dev-only warnings via console.warn — one of
// them on every wired card that mounts outside a `role="radiogroup"`, which is
// most of this suite. Silence them and keep a handle for the assertions.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma masters, verbatim (Board A row y=1004): LiqPay is the rest/hover/
// disabled master and WayForPay the selected one — brand is content, never state.
// The card bakes in no literals of its own, so the provider name and the mark's
// intrinsic size are consumer data.
const LIQPAY: string = 'LiqPay';
const WAYFORPAY: string = 'WayForPay';
const LIQPAY_LOGO: IntegrationLogo = { src: '/liqpay.png', width: 116, height: 24 };
const LIQPAY_GREY_LOGO: IntegrationLogo = { src: '/liqpay-grey.png', width: 116, height: 24 };
const WAYFORPAY_LOGO: IntegrationLogo = { src: '/wayforpay.png', width: 187, height: 67 };

// Runtime data (CMS/API) violates the strict prop types all the time; these
// fixtures model exactly that, which is what the dev-only backstops exist for.
const NO_SIZE_LOGO: IntegrationLogo = { src: '/liqpay.png' } as unknown as IntegrationLogo;

// Every state literal the styles ship, pinned so a mutant that rewrites one of
// them fails here rather than only in a screenshot.
const CARD_FILL: string = '#f4f5f6';
const WHITE: string = '#FFF';
const PRIMARY: string = '#1EAEFF';
const GREY400: string = '#D0D4D8';
const BRAND_GRAY: string = '#E1E7EA';
const SELECTED_RING: string = 'inset 0 0 0 1px #1EAEFF';
const FOCUS_RING: string = 'inset 0 0 0 2px #1A1C1E';
const HOVER_SELECTOR: string = '&:hover:not([aria-disabled="true"]):not([aria-checked="true"])';
const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])';

interface CardOverrides {
  name?: string | undefined;
  logo?: IntegrationLogo | undefined;
  logoDisabled?: IntegrationLogo | undefined;
  selected?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  sx?: UiPaymentOptionCardProps['sx'] | undefined;
}

// Props are applied one by one (the repo forbids JSX spreading). `in` checks keep
// the "runtime data violates the prop type" fixtures — a missing name, an absent
// logo bundle — expressible as an explicit `undefined`.
function cardWith(extra: Readonly<CardOverrides>): React.ReactElement {
  const name: string = ('name' in extra ? extra.name : LIQPAY) as string;
  const logo: IntegrationLogo = ('logo' in extra ? extra.logo : LIQPAY_LOGO) as IntegrationLogo;
  return (
    <UiPaymentOptionCard
      name={name}
      logo={logo}
      logoDisabled={extra.logoDisabled}
      selected={extra.selected}
      onSelect={extra.onSelect}
      disabled={extra.disabled}
      id={extra.id}
      sx={extra.sx}
    />
  );
}

// The consumer half of the ownership split: the group, its selection model and
// its accessible name all belong outside the card. Wrapping suppresses the
// radiogroup-context teaching warning, so the "stays silent" assertions are exact.
function inGroup(node: React.ReactElement): React.ReactElement {
  return <div role="radiogroup">{node}</div>;
}

function card(): HTMLElement {
  return screen.getByRole('radio');
}

function cardImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img'));
}

function circle(): Element {
  return firstOf(nodesMatching(`.${CIRCLE_CLASS}`));
}

function layersOf(interactive: boolean, sx: UiPaymentOptionCardProps['sx']): SxLayers {
  return paymentOptionCardSx({ interactive, sx }) as SxLayers;
}

function baseOf(interactive: boolean): StyleObject {
  return firstOf(layersOf(interactive, undefined));
}

// The behaviour every radio card in the toolkit shares — role and permanent
// `aria-checked`, the selection-request gate, the `aria-disabled` boundary, tab
// order and ref plumbing, the live-region prohibition, the radiogroup teaching
// warning and the `sx` merge — is asserted once for both cards. What follows
// below is what is TRUE OF THIS CARD ALONE.
describeRadioCardContract({
  name: 'UiPaymentOptionCard',
  cardWith,
  inGroup,
  warn,
  primaryName: LIQPAY,
  secondaryName: WAYFORPAY,
  remountId: 'payment-7',
  unusableLogo: { logo: NO_SIZE_LOGO } as CardOverrides,
  tabOrderGroup: (): React.ReactElement => (
    <div role="radiogroup">
      <UiPaymentOptionCard name={LIQPAY} logo={LIQPAY_LOGO} onSelect={noop} />
      <UiPaymentOptionCard name="Static" logo={WAYFORPAY_LOGO} />
      <UiPaymentOptionCard name={WAYFORPAY} logo={WAYFORPAY_LOGO} selected onSelect={noop} />
    </div>
  ),
  withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
    <UiPaymentOptionCard ref={ref} name={LIQPAY} logo={LIQPAY_LOGO} onSelect={noop} />
  ),
  staticBase: (): StyleObject => baseOf(false),
});

describeRadioCardRefHook({ name: 'usePaymentCardRef', useRef: usePaymentCardRef, warn });

describe('UiPaymentOptionCard — wired radio semantics (contract §1.1/§1.2)', () => {
  it('renders the selection circle as an aria-hidden span that is never a control', () => {
    render(cardWith({ onSelect: noop }));

    const dot: Element = circle();
    expect(dot.tagName).toBe('SPAN');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).not.toHaveAttribute('role');
    expect(dot).not.toHaveAttribute('tabindex');
    expect(nodesMatching(`.${CIRCLE_CLASS}`)).toHaveLength(1);
  });

  it('carries zero text nodes — the wordmark image is the whole content', () => {
    render(cardWith({ onSelect: noop }));

    expect(screen.queryAllByText(/./)).toHaveLength(0);
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
    expect(nodesMatching(`.${LOGO_CLASS}`)).toHaveLength(1);
  });

  it('applies id only when the consumer supplies one', () => {
    const { rerender } = render(cardWith({ onSelect: noop }));

    expect(card()).not.toHaveAttribute('id');

    rerender(cardWith({ id: 'payment-liqpay', onSelect: noop }));
    expect(card()).toHaveAttribute('id', 'payment-liqpay');
  });

  it('exposes its display name', () => {
    expect(UiPaymentOptionCard.displayName).toBe('UiPaymentOptionCard');
  });
});

describe('UiPaymentOptionCard — static (unwired) card', () => {
  it('keeps the identical content tree, including the consumer id', () => {
    render(cardWith({ id: 'static-card' }));

    const root: Element = firstOf(nodesMatching('#static-card'));
    expect(root.tagName).toBe('DIV');
    expect(root.contains(circle())).toBe(true);
    expect(cardImages()).toHaveLength(1);
    expect(screen.getByRole('img')).toHaveAccessibleName(LIQPAY);
  });

  it('keeps the full-colour mark on a disabled static card', () => {
    // The grey mark rides the `aria-disabled` boundary, which the static branch
    // never crosses — so it can never paint a disabled-looking card.
    render(cardWith({ disabled: true, logoDisabled: LIQPAY_GREY_LOGO }));

    expect(firstOf(cardImages())).toHaveAttribute('src', '/liqpay.png');
  });
});

describe('UiPaymentOptionCard — focus and tab order', () => {});

describe('UiPaymentOptionCard — accessible name and imagery (Ruling 1)', () => {
  it('names the card with the wordmark alt exactly, with no aria-label anywhere', () => {
    render(cardWith({ onSelect: noop }));

    // The one deliberate deviation from UiIntegrationCard: this card has no
    // visible text, so a decorative `alt=""` would ship a nameless radio.
    expect(card()).toHaveAccessibleName(LIQPAY);
    expect(firstOf(cardImages())).toHaveAttribute('alt', LIQPAY);
    expect(nodesMatching('[aria-label], [aria-labelledby]')).toHaveLength(0);
    expect(card()).not.toHaveAttribute('title');
  });

  it('paints the wordmark with the full image hygiene attribute set', () => {
    render(cardWith({ onSelect: noop }));

    const img: HTMLImageElement = firstOf(cardImages());
    expect(cardImages()).toHaveLength(1);
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/liqpay.png');
    expect(img).toHaveAttribute('width', '116');
    expect(img).toHaveAttribute('height', '24');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('draggable', 'false');
    // Payment options are above-the-fold checkout content.
    expect(img).not.toHaveAttribute('loading');
    expect(img).not.toHaveAttribute('onerror');
    expect(img).not.toHaveAttribute('title');
  });

  it('accepts a static import object as the mark source', () => {
    render(inGroup(cardWith({ logo: { src: { src: '/imported.png' }, width: 116, height: 24 } })));

    expect(firstOf(cardImages())).toHaveAttribute('src', '/imported.png');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('keeps each accessible name untouched by a second brand on the page', () => {
    render(
      <div role="radiogroup">
        <UiPaymentOptionCard name={LIQPAY} logo={LIQPAY_LOGO} onSelect={noop} />
        <UiPaymentOptionCard name={WAYFORPAY} logo={WAYFORPAY_LOGO} onSelect={noop} />
      </div>
    );

    expect(screen.getByRole('radio', { name: LIQPAY })).toHaveAccessibleName(LIQPAY);
    expect(screen.getByRole('radio', { name: WAYFORPAY })).toHaveAccessibleName(WAYFORPAY);
  });

  it('renders no img at all for an unusable bundle, keeping the geometry', () => {
    const { rerender } = render(cardWith({ logo: { src: '', width: 116, height: 24 } }));
    expect(cardImages()).toHaveLength(0);

    // A whitespace-only src is just as unfetchable as a blank one, and must take
    // the same path rather than painting a broken image with no warning.
    rerender(cardWith({ logo: { src: '   ', width: 116, height: 24 } }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: { src: { src: '  ' }, width: 116, height: 24 } }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: { src: { src: '' }, width: 116, height: 24 } }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: NO_SIZE_LOGO }));
    expect(cardImages()).toHaveLength(0);

    rerender(cardWith({ logo: undefined }));
    expect(cardImages()).toHaveLength(0);
    // The circle and the card `minHeight` keep the box either way.
    expect(circle()).toBeInTheDocument();
    expect(baseOf(false).minHeight).toBe('5.625rem');
  });

  it('keeps the radio named through a visually hidden fallback when no mark renders', () => {
    render(inGroup(cardWith({ logo: NO_SIZE_LOGO, onSelect: noop })));

    // The wordmark's `alt` is normally this card's whole accessible name, so an
    // unusable bundle would otherwise ship a nameless radio (SC 4.1.2).
    expect(cardImages()).toHaveLength(0);
    expect(card()).toHaveAccessibleName(LIQPAY);
    expect(screen.getByText(LIQPAY)).toBeInTheDocument();
  });

  it('transcribes a long provider name whole, with no clamp on the wordmark', () => {
    const LONG: string = 'LiqPay Checkout for Merchants and Marketplaces';
    render(cardWith({ name: LONG, onSelect: noop }));

    expect(card()).toHaveAccessibleName(LONG);
    expect((paymentLogoSx as StyleObject).textOverflow).toBeUndefined();
    expect(baseOf(true).overflow).toBeUndefined();
  });
});

describe('UiPaymentOptionCard — disabled wordmark resolution', () => {
  it('swaps in the flat-grey ASSET when a disabled card ships one', () => {
    render(cardWith({ disabled: true, logoDisabled: LIQPAY_GREY_LOGO, onSelect: noop }));

    const img: HTMLImageElement = firstOf(cardImages());
    expect(img).toHaveAttribute('src', '/liqpay-grey.png');
    // The name channel is untouched by the asset swap.
    expect(card()).toHaveAccessibleName(LIQPAY);
    // An ASSET swap, never a CSS filter: `grayscale(1)` misses Figma's #D0D4D8.
    expect(JSON.stringify(paymentLogoSx)).not.toMatch(/filter|opacity/i);
  });

  it('falls back to the full-colour mark when no grey variant exists', () => {
    render(cardWith({ disabled: true, onSelect: noop }));

    expect(firstOf(cardImages())).toHaveAttribute('src', '/liqpay.png');
  });

  it('falls back when the grey variant is itself unusable', () => {
    render(cardWith({ disabled: true, logoDisabled: NO_SIZE_LOGO, onSelect: noop }));

    expect(firstOf(cardImages())).toHaveAttribute('src', '/liqpay.png');
  });

  it('keeps the full-colour mark on an enabled card that ships a grey one', () => {
    render(cardWith({ logoDisabled: LIQPAY_GREY_LOGO, onSelect: noop }));

    expect(firstOf(cardImages())).toHaveAttribute('src', '/liqpay.png');
  });
});

describe('UiPaymentOptionCard — dev warnings', () => {
  it('stays silent when a disabled card paints its usable grey mark', () => {
    // The rendered mark is what matters: `logo` alone is unusable here, but the
    // disabled card really does paint `logoDisabled`, so nothing is missing.
    render(
      inGroup(
        cardWith({
          logo: NO_SIZE_LOGO,
          logoDisabled: LIQPAY_GREY_LOGO,
          disabled: true,
          onSelect: noop,
        })
      )
    );

    expect(firstOf(cardImages())).toHaveAttribute('src', '/liqpay-grey.png');
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('reports the blank name ahead of an unusable bundle', () => {
    render(inGroup(cardWith({ name: '', logo: NO_SIZE_LOGO, onSelect: noop })));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });

  it('never warns about the disabled mark, which legitimately falls back', () => {
    render(inGroup(cardWith({ disabled: true, logoDisabled: NO_SIZE_LOGO, onSelect: noop })));
    expect(warn.spy).not.toHaveBeenCalled();
  });
});

describe('paymentOptionCardSx — style assembly (pure, mutation-killing)', () => {
  it('pins the card box to the measured master geometry', () => {
    const base: StyleObject = baseOf(true);

    expect(base.backgroundColor).toBe(CARD_FILL);
    expect(base.border).toBe(`1px solid ${CARD_FILL}`);
    expect(base.borderRadius).toBe('0.5rem');
    expect(base.width).toBe('100%');
    // Fluid height: a `minHeight`, never a `height`, so an oversized wordmark may
    // grow the card at 200% zoom without shearing.
    expect(base.minHeight).toBe('5.625rem');
    expect(base.height).toBeUndefined();
    expect(base.boxSizing).toBe('border-box');
    // `position: relative` anchors the absolutely positioned circle; the flex box
    // centres the wordmark on the CARD's own axis, not beside the circle.
    expect(base.position).toBe('relative');
    expect(base.display).toBe('flex');
    expect(base.alignItems).toBe('center');
    expect(base.justifyContent).toBe('center');
    expect(base.margin).toBe(0);
    expect(base.padding).toBe(0);
    expect(base.font).toBe('inherit');
  });

  it('adds cursor, hover, selected, ring and forced colors only to the wired branch', () => {
    const base: StyleObject = baseOf(true);

    expect(base.cursor).toBe('pointer');
    expect(base.appearance).toBe('none');
    expect(base['@media (forced-colors: active)']).toEqual({
      // The SAME selector list as the ring rule, not a bare `:focus-visible`:
      // a media query adds no specificity, so the shorter selector would lose to
      // the ring's own `outline: none` and leave forced-colors users no indicator.
      [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
    });
  });

  it('suppresses the pointer cursor and paints the solid disc while disabled', () => {
    expect(baseOf(true)['&[aria-disabled="true"]']).toEqual({
      cursor: 'default',
      // The ONE divergence from the 3.4 glyph: a solid brandGray disc, no stroke.
      [`& .${CIRCLE_CLASS}`]: { backgroundColor: BRAND_GRAY, border: 'none' },
    });
  });

  it('gates hover on BOTH the aria-disabled boundary and the checked state', () => {
    const base: StyleObject = baseOf(true);
    const hoverKeys: string[] = keysMatching(base, ':hover');

    expect(hoverKeys).toEqual([HOVER_SELECTOR]);
    expect(base['&:hover']).toBeUndefined();
    expect(base[firstOf(hoverKeys)]).toEqual({
      backgroundColor: WHITE,
      borderColor: PRIMARY,
      [`& .${CIRCLE_CLASS}`]: { border: `1px solid ${PRIMARY}` },
    });
  });

  it('paints the selected chrome and the 5px checked circle off aria-checked', () => {
    expect(baseOf(true)['&[aria-checked="true"]']).toEqual({
      backgroundColor: WHITE,
      borderColor: PRIMARY,
      // The second border pixel as a shadow layer, so the box model never moves.
      boxShadow: SELECTED_RING,
      // Border WIDTH, not colour — the distinction survives forced-colors mode.
      [`& .${CIRCLE_CLASS}`]: { border: `5px solid ${PRIMARY}` },
    });
  });

  it('declares the inset ring after the disabled, hover and selected rules', () => {
    const keys: string[] = Object.keys(baseOf(true));
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const checked: number = keys.indexOf('&[aria-checked="true"]');
    const ring: number = keys.findIndex((key: string) => key.includes(':focus-visible'));

    expect(disabled).toBeGreaterThanOrEqual(0);
    expect(hover).toBeGreaterThan(disabled);
    expect(checked).toBeGreaterThan(hover);
    expect(ring).toBeGreaterThan(checked);
  });

  it('ships the ring as the Amendment A1 two-selector list so hover cannot outrank it', () => {
    const base: StyleObject = baseOf(true);
    const ringKeys: string[] = keysMatching(base, ':focus-visible');

    // A bare `&:focus-visible` is (0,2,0) while the hover rule is (0,4,0), so on a
    // card that is focused AND hovered the hover chrome would win and the ring
    // would vanish. The second selector repeats hover's negations to tie its
    // specificity; declared later, it wins. The bare one still covers the disabled
    // and selected cards.
    expect(ringKeys).toEqual([FOCUS_SELECTORS]);
    expect(base[firstOf(ringKeys)]).toEqual({ outline: 'none', boxShadow: FOCUS_RING });
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
    // the same rest presentation.
    expect(base.border).toBe(`1px solid ${CARD_FILL}`);
    expect(base.borderRadius).toBe('0.5rem');
    expect(base.minHeight).toBe('5.625rem');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);
    const hover: StyleObject = base[HOVER_SELECTOR] as StyleObject;
    const checked: StyleObject = base['&[aria-checked="true"]'] as StyleObject;

    // Figma draws a 0/1/2px ladder; shipping it literally would reflow the content
    // box by 2px on selection, so only `borderColor` ever changes.
    expect(base.border).toBe(`1px solid ${CARD_FILL}`);
    expect(hover.border).toBeUndefined();
    expect(hover.borderWidth).toBeUndefined();
    expect(checked.border).toBeUndefined();
    expect(checked.borderWidth).toBeUndefined();
  });

  it('ships no transition and no animation, so nothing can move', () => {
    const serialised: string = JSON.stringify([
      baseOf(true),
      baseOf(false),
      selectionCircleSx,
      paymentLogoSx,
    ]);

    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
    // No state has a shadow other than the selected second pixel and the ring.
    expect(baseOf(true).boxShadow).toBeUndefined();
    expect(baseOf(false).boxShadow).toBeUndefined();
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

describe('payment-option-card styles — content recipes (pure, mutation-killing)', () => {
  it('reproduces the UiIntegrationCard radio-dot recipe exactly', () => {
    const dot: StyleObject = selectionCircleSx as StyleObject;

    expect(dot.position).toBe('absolute');
    // Figma places the circle at (12, 12) from the card's OUTER edge, and the CSS
    // border sits outside the padding box, so the offset compensates: 12 - 1 = 11.
    expect(dot.left).toBe('0.6875rem');
    expect(dot.top).toBe('0.6875rem');
    expect(dot.width).toBe('1.25rem');
    expect(dot.height).toBe('1.25rem');
    expect(dot.borderRadius).toBe('50%');
    expect(dot.boxSizing).toBe('border-box');
    expect(dot.backgroundColor).toBe(WHITE);
    expect(dot.border).toBe(`1px solid ${GREY400}`);
  });

  it('keeps the wordmark a block that scales instead of shearing', () => {
    const mark: StyleObject = paymentLogoSx as StyleObject;

    expect(mark.display).toBe('block');
    expect(mark.maxWidth).toBe('100%');
    expect(mark.height).toBe('auto');
    // The intrinsic attributes carry the aspect ratio; no explicit width here.
    expect(mark.width).toBeUndefined();
  });

  it('exposes stable class hooks the root drives its descendants through', () => {
    expect(CIRCLE_CLASS).toBe('ui-payment-option-card__circle');
    expect(LOGO_CLASS).toBe('ui-payment-option-card__logo');
  });
});

describe('resolvePaymentLogo — bundle resolution', () => {
  it('accepts a URL string and a static import alike', () => {
    expect(resolvePaymentLogo({ src: '/liqpay.png', width: 116, height: 24 })).toEqual({
      src: '/liqpay.png',
      width: 116,
      height: 24,
    });
    expect(resolvePaymentLogo({ src: { src: '/imported.png' }, width: 187, height: 67 })).toEqual({
      src: '/imported.png',
      width: 187,
      height: 67,
    });
  });

  it('rejects a blank, nullish or absent source', () => {
    expect(resolvePaymentLogo({ src: '', width: 116, height: 24 })).toBeNull();
    expect(resolvePaymentLogo({ src: { src: '' }, width: 116, height: 24 })).toBeNull();
    expect(resolvePaymentLogo(undefined)).toBeNull();
    expect(resolvePaymentLogo({ width: 116, height: 24 } as unknown as IntegrationLogo)).toBeNull();
  });

  it('rejects any dimension that cannot reproduce the master geometry', () => {
    const cases: readonly IntegrationLogo[] = [
      { src: '/x.png', width: 0, height: 24 },
      { src: '/x.png', width: 116, height: 0 },
      { src: '/x.png', width: -116, height: 24 },
      { src: '/x.png', width: Number.NaN, height: 24 },
      { src: '/x.png', width: Number.POSITIVE_INFINITY, height: 24 },
      { src: '/x.png', height: 24 } as unknown as IntegrationLogo,
      { src: '/x.png', width: 116 } as unknown as IntegrationLogo,
    ];

    cases.forEach((logo: IntegrationLogo): void => {
      expect(resolvePaymentLogo(logo)).toBeNull();
    });
  });
});

describe('resolvePaymentMark — the enabled/disabled asset choice', () => {
  const CARD: UiPaymentOptionCardProps = {
    name: LIQPAY,
    logo: LIQPAY_LOGO,
    logoDisabled: LIQPAY_GREY_LOGO,
  };

  it('ignores the grey variant entirely while enabled', () => {
    expect(resolvePaymentMark({ card: CARD, disabled: false })).toEqual({
      src: '/liqpay.png',
      width: 116,
      height: 24,
    });
  });

  it('swaps to the grey variant while disabled', () => {
    expect(resolvePaymentMark({ card: CARD, disabled: true })).toEqual({
      src: '/liqpay-grey.png',
      width: 116,
      height: 24,
    });
  });

  it('falls back to the full-colour mark when the grey one is absent or unusable', () => {
    const noGrey: UiPaymentOptionCardProps = { name: WAYFORPAY, logo: WAYFORPAY_LOGO };
    expect(resolvePaymentMark({ card: noGrey, disabled: true })?.src).toBe('/wayforpay.png');

    const badGrey: UiPaymentOptionCardProps = {
      name: LIQPAY,
      logo: LIQPAY_LOGO,
      logoDisabled: NO_SIZE_LOGO,
    };
    expect(resolvePaymentMark({ card: badGrey, disabled: true })?.src).toBe('/liqpay.png');
  });

  it('returns null when neither bundle is usable', () => {
    const unusable: UiPaymentOptionCardProps = { name: LIQPAY, logo: NO_SIZE_LOGO };
    expect(resolvePaymentMark({ card: unusable, disabled: false })).toBeNull();
    expect(resolvePaymentMark({ card: unusable, disabled: true })).toBeNull();
  });
});

describe('usePaymentCard — card view model', () => {
  function modelFor(props: UiPaymentOptionCardProps): PaymentCardModel {
    return renderHook((): PaymentCardModel => usePaymentCard(props, null)).result.current;
  }

  it('marks an unwired card non-interactive with no aria-disabled', () => {
    const model: PaymentCardModel = modelFor({ name: LIQPAY, logo: LIQPAY_LOGO });

    expect(model.interactive).toBe(false);
    expect(model.ariaChecked).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    expect(model.logo).toEqual({ src: '/liqpay.png', width: 116, height: 24 });
  });

  it('does not throw when an unwired card is activated (no onSelect to call)', () => {
    const model: PaymentCardModel = modelFor({ name: LIQPAY, logo: LIQPAY_LOGO });
    expect(() => model.onActivate()).not.toThrow();
  });

  it('leaves aria-disabled off a disabled but UNWIRED card', () => {
    const model: PaymentCardModel = modelFor({
      name: LIQPAY,
      logo: LIQPAY_LOGO,
      logoDisabled: LIQPAY_GREY_LOGO,
      disabled: true,
    });

    expect(model.interactive).toBe(false);
    expect(model.ariaDisabled).toBeUndefined();
    // The grey mark rides the boundary, so the static branch keeps the colour one.
    expect(model.logo?.src).toBe('/liqpay.png');
  });

  it('swallows activation while disabled, before any model work', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: PaymentCardModel = modelFor({
      name: LIQPAY,
      logo: LIQPAY_LOGO,
      logoDisabled: LIQPAY_GREY_LOGO,
      disabled: true,
      onSelect,
    });

    model.onActivate();

    expect(onSelect).not.toHaveBeenCalled();
    expect(model.ariaDisabled).toBe(true);
    expect(model.logo?.src).toBe('/liqpay-grey.png');
  });

  it('swallows activation on an already-selected card', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: PaymentCardModel = modelFor({
      name: LIQPAY,
      logo: LIQPAY_LOGO,
      selected: true,
      onSelect,
    });

    model.onActivate();

    expect(onSelect).not.toHaveBeenCalled();
    expect(model.ariaChecked).toBe(true);
  });

  it('reports selection once for a wired, enabled, unselected card', () => {
    const onSelect: jest.Mock = jest.fn();
    const model: PaymentCardModel = modelFor({ name: LIQPAY, logo: LIQPAY_LOGO, onSelect });

    model.onActivate();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(model.interactive).toBe(true);
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('resolves an unusable bundle to a null logo rather than a broken img', () => {
    expect(modelFor({ name: LIQPAY, logo: NO_SIZE_LOGO }).logo).toBeNull();
  });

  it('warns instead of throwing when runtime data hands it a non-string name', () => {
    // The warning message is built on every render of the production build too —
    // only the `console.warn` is stripped — so a `.trim()` on a number would take
    // the whole card down rather than reporting the bad payload.
    const badName: string = 42 as unknown as string;

    expect(() => modelFor({ name: badName, logo: LIQPAY_LOGO })).not.toThrow();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `name`'));
  });
});
