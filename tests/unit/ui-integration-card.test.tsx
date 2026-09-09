import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';

import UiIntegrationCard from '../../src/components/ui-integration-card';
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

import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleWarn from './utils/mock-console-warn';
import { describeRadioCardContract, describeRadioCardRefHook } from './utils/radio-card-contract';
import { keysMatching, type StyleObject, type SxLayers } from './utils/style-layers';

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
  name?: string | undefined;
  logo?: IntegrationLogo | undefined;
  selected?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  sx?: UiIntegrationCardProps['sx'] | undefined;
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

// The logo is decorative (`alt=""`, §5.2), so it drops out of the accessibility
// tree and is reached by node query rather than by role — the task-card precedent.
function cardImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img'));
}

function glyph(): Element {
  return firstOf(nodesMatching(`.${GLYPH_CLASS}`));
}

function layersOf(interactive: boolean, sx: UiIntegrationCardProps['sx']): SxLayers {
  return integrationCardSx({ interactive, sx }) as SxLayers;
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
  name: 'UiIntegrationCard',
  cardWith,
  inGroup,
  warn,
  primaryName: HUBSPOT,
  secondaryName: AMOCRM,
  remountId: 'integration-7',
  unusableLogo: { logo: NO_SIZE_LOGO } as CardOverrides,
  tabOrderGroup: (): React.ReactElement => (
    <div role="radiogroup">
      <UiIntegrationCard name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />
      <UiIntegrationCard name="Static" logo={AMOCRM_LOGO} />
      <UiIntegrationCard name={AMOCRM} logo={AMOCRM_LOGO} selected onSelect={noop} />
    </div>
  ),
  withRef: (ref: React.Ref<HTMLButtonElement>): React.ReactElement => (
    <UiIntegrationCard ref={ref} name={HUBSPOT} logo={HUBSPOT_LOGO} onSelect={noop} />
  ),
  staticBase: (): StyleObject => baseOf(false),
});

describeRadioCardRefHook({ name: 'useCardRef', useRef: useCardRef, warn });

describe('UiIntegrationCard — wired radio semantics (§1.1/§2/§13.3)', () => {
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

    const label: Element = firstOf(nodesMatching(`.${NAME_CLASS}`));
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
  it('keeps the identical content tree, including the consumer id and lang', () => {
    render(cardWith({ id: 'static-card', lang: 'en' }));

    const root: Element = firstOf(nodesMatching('#static-card'));
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('lang', 'en');
    expect(root.contains(glyph())).toBe(true);
    expect(cardImages()).toHaveLength(1);
    expect(screen.getByText(HUBSPOT)).toBeInTheDocument();
  });
});

describe('UiIntegrationCard — focus and tab order (§4.2/§4.3)', () => {});

describe('UiIntegrationCard — accessible name and imagery (§5/§13.6)', () => {
  it('names the card with the brand name exactly, with no aria-label anywhere', () => {
    render(cardWith({ onSelect: noop }));

    expect(card()).toHaveAccessibleName(HUBSPOT);
    expect(nodesMatching('[aria-label], [aria-labelledby]')).toHaveLength(0);
    expect(card()).not.toHaveAttribute('title');
  });

  it('paints the logo as a decorative img with the full hygiene attribute set', () => {
    render(cardWith({ onSelect: noop }));

    const img: HTMLImageElement = firstOf(cardImages());
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

    expect(firstOf(cardImages())).toHaveAttribute('src', '/imported.png');
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

describe('UiIntegrationCard — dev warnings (§12/§13.8)', () => {});

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
    expect(base[firstOf(hoverKeys)]).toEqual({
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
    // the same rest presentation (§2.2).
    expect(base.border).toBe('1px solid #E1E7EA');
    expect(base.borderRadius).toBe('0.75rem');
  });

  it('keeps the border a constant 1px in every state, swapping only its colour', () => {
    const base: StyleObject = baseOf(true);
    const hover: StyleObject = base[firstOf(keysMatching(base, ':hover'))] as StyleObject;
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
