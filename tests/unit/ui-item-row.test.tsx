import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiItemRow } from '../../src/components';
import { resolveRecipe, type RowRecipe } from '../../src/components/ui-item-row/recipe';
import { iconGroupSx, rowContainerSx } from '../../src/components/ui-item-row/styles';
import { useItemRow, type ItemRowModel } from '../../src/components/ui-item-row/use-item-row';

import mockConsoleWarn from './utils/mock-console-warn';

// UiItemRow emits dev-only disclosure guidance via console.warn; silence it for
// the suite and keep a handle for the assertions that check on it.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// The Figma sample endpoint (literal strings, typos preserved). Its accessible
// name is the concatenation "{METHOD} {path} {description}" (a11y contract §2.1).
const SAMPLE_PATH: string = '/put/{petID}/uploadImage';
const SAMPLE_DESC: string = 'Uploads an image';
const SAMPLE_NAME: string = 'GET /put/{petID}/uploadImage Uploads an image';

// Collect the row's decorative glyphs. They carry no role (a11y contract §5),
// so — like the pagination chevron-glyph precedent — they are reached by node
// query rather than a semantic one.
function rowSvgs(): SVGElement[] {
  return Array.from(document.querySelectorAll<SVGElement>('svg'));
}

describe('UiItemRow — wired disclosure semantics', () => {
  it('renders the whole row as one native type="button" named from its content', () => {
    render(<UiItemRow method="get" path={SAMPLE_PATH} description={SAMPLE_DESC} onToggle={noop} />);

    const button: HTMLElement = screen.getByRole('button', { name: SAMPLE_NAME });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button.tagName).toBe('BUTTON');
  });

  it('drops the description from the name when it is omitted', () => {
    render(<UiItemRow method="put" path="/pet" onToggle={noop} />);
    expect(screen.getByRole('button', { name: 'PUT /pet' })).toBeInTheDocument();
  });

  it('renders exactly one button (no nested interactives)', () => {
    render(<UiItemRow method="post" path="/pet" onToggle={noop} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('exposes its display name', () => {
    expect(UiItemRow.displayName).toBe('UiItemRow');
  });
});

describe('UiItemRow — aria-expanded lifecycle (always controlled)', () => {
  it('reflects a collapsed row and never self-flips on activation', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(<UiItemRow method="get" path="/pet" onToggle={onToggle} />);

    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    // Controlled: the DOM stays collapsed until the consumer feeds `expanded` back.
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows aria-expanded="true" once the consumer sets expanded', () => {
    const { rerender } = render(<UiItemRow method="get" path="/pet" onToggle={noop} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');

    rerender(<UiItemRow method="get" path="/pet" expanded onToggle={noop} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('UiItemRow — aria-controls lifecycle', () => {
  it('omits aria-controls while collapsed even with a panelId', () => {
    render(<UiItemRow method="get" path="/pet" panelId="panel-1" onToggle={noop} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-controls');
  });

  it('surfaces aria-controls only while expanded AND a panelId is given', () => {
    render(<UiItemRow method="get" path="/pet" expanded panelId="panel-1" onToggle={noop} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'panel-1');
  });

  it('never renders aria-controls when no panelId is supplied', () => {
    render(<UiItemRow method="get" path="/pet" expanded onToggle={noop} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-controls');
  });
});

describe('UiItemRow — unwired static row', () => {
  it('is not a button and exposes no disclosure attributes, but keeps its text', () => {
    render(<UiItemRow method="delete" path="/delete/{petID}" description="Deletes exiting pet" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('/delete/{petID}')).toBeInTheDocument();
    expect(screen.getByText('Deletes exiting pet')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('still renders the (decorative) chevron and padlock glyphs', () => {
    render(<UiItemRow method="delete" path="/pet" />);
    expect(rowSvgs()).toHaveLength(2);
  });
});

describe('UiItemRow — keyboard activation', () => {
  it('activates with Enter', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(<UiItemRow method="get" path="/pet" onToggle={onToggle} />);

    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('activates with Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(<UiItemRow method="get" path="/pet" onToggle={onToggle} />);

    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('reaches every wired row in DOM order and skips unwired rows', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiItemRow method="get" path="/first" onToggle={noop} />
        <UiItemRow method="put" path="/static" />
        <UiItemRow method="post" path="/second" onToggle={noop} />
      </>
    );

    const first: HTMLElement = screen.getByRole('button', { name: 'GET /first' });
    const second: HTMLElement = screen.getByRole('button', { name: 'POST /second' });

    await user.tab();
    expect(first).toHaveFocus();
    await user.tab();
    // The unwired PUT row is not tabbable, so focus jumps straight to the second
    // wired row.
    expect(second).toHaveFocus();
  });
});

describe('UiItemRow — muted (aria-disabled boundary) status', () => {
  it('keeps a muted wired row a focusable button with aria-disabled and no native disable', () => {
    render(<UiItemRow method="get" path="/pet" muted onToggle={noop} />);
    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
  });

  it('no-ops activation while muted (onToggle never fires)', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    render(<UiItemRow method="get" path="/pet" muted onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('keeps aria-expanded reflecting expanded on a muted row (independent axes)', () => {
    render(<UiItemRow method="get" path="/pet" muted expanded onToggle={noop} />);
    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('a muted UNWIRED row is plain static content with no aria-disabled', () => {
    render(<UiItemRow method="get" path="/pet" muted />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('/pet')).not.toHaveAttribute('aria-disabled');
  });

  it('retains keyboard focus when a focused row becomes muted on re-render', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    const { rerender } = render(<UiItemRow method="get" path="/pet" onToggle={onToggle} />);

    const button: HTMLElement = screen.getByRole('button');
    button.focus();
    await user.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);

    // The consumer flips the row to muted while it holds focus; it must keep focus
    // (aria-disabled boundary, never native disabled) instead of dropping to body.
    rerender(<UiItemRow method="get" path="/pet" muted onToggle={onToggle} />);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
  });
});

describe('UiItemRow — decorative icons', () => {
  it('renders exactly two glyphs, both hidden from assistive tech', () => {
    render(<UiItemRow method="get" path="/pet" onToggle={noop} />);

    const svgs: SVGElement[] = rowSvgs();
    expect(svgs).toHaveLength(2);
    svgs.forEach((svg: SVGElement) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('focusable', 'false');
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });

  it('draws the down chevron as a stroked 1.667px currentColor path', () => {
    render(<UiItemRow method="get" path="/pet" onToggle={noop} />);

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyphs, no role
    const chevron: SVGPathElement | null = document.querySelector<SVGPathElement>(
      'svg path[stroke="currentColor"]'
    );
    expect(chevron).not.toBeNull();
    expect(chevron).toHaveAttribute('d', 'M5 7.5 10 12.5 15 7.5');
    expect(chevron).toHaveAttribute('stroke-width', '1.667');
    expect(chevron).toHaveAttribute('stroke-linecap', 'round');
    expect(chevron).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('fills the open padlock with the Font/250 grey and gives it no stroke', () => {
    render(<UiItemRow method="get" path="/pet" onToggle={noop} />);

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyphs, no role
    const padlock: SVGPathElement | null = document.querySelector<SVGPathElement>(
      'svg path[fill="#57595B"]'
    );
    expect(padlock).not.toBeNull();
    expect(padlock).not.toHaveAttribute('stroke');
    expect(padlock?.getAttribute('d')).toMatch(/^M14\.1673 7\.50004/);
  });
});

describe('UiItemRow — no toggle announcement (live-region prohibition)', () => {
  it('exposes no status or alert region before or after toggling', async () => {
    const user: UserEvent = userEvent.setup();
    const onToggle: jest.Mock = jest.fn();
    const { rerender } = render(<UiItemRow method="get" path="/pet" onToggle={onToggle} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    rerender(<UiItemRow method="get" path="/pet" expanded onToggle={onToggle} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('UiItemRow — dev warnings (disclosure misconfiguration)', () => {
  it('warns when expanded is passed without onToggle', () => {
    render(<UiItemRow method="get" path="/pet" expanded />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('without `onToggle`'));
  });

  it('warns when panelId is passed without onToggle', () => {
    render(<UiItemRow method="get" path="/pet" panelId="panel-1" />);
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('without `onToggle`'));
  });

  it('stays quiet when the disclosure props accompany onToggle', () => {
    render(<UiItemRow method="get" path="/pet" expanded panelId="panel-1" onToggle={noop} />);
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('stays quiet for a plain static row with no disclosure props', () => {
    render(<UiItemRow method="get" path="/pet" />);
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('emits no warning in production even when misconfigured', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<UiItemRow method="get" path="/pet" expanded />);
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});

describe('UiItemRow — consumer sx', () => {
  it('applies an object sx to the row', () => {
    render(<UiItemRow method="get" path="/pet" sx={{ marginTop: '1rem' }} onToggle={noop} />);
    expect(screen.getByRole('button')).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies an array sx to the row', () => {
    render(
      <UiItemRow
        method="get"
        path="/pet"
        sx={[{ marginTop: '1rem' }, { paddingTop: '2rem' }]}
        onToggle={noop}
      />
    );
    const button: HTMLElement = screen.getByRole('button');
    expect(button).toHaveStyle({ marginTop: '1rem' });
    expect(button).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('resolveRecipe — per-method colour maps (exact, mutation-killing)', () => {
  it('maps GET to the blue accent recipe', () => {
    const r: RowRecipe = resolveRecipe('get', false);
    expect(r).toMatchObject({
      accent: '#1EAEFF',
      accentHover: '#0091E2',
      tint: 'rgba(30, 174, 255, 0.1)',
      badgeInk: '#1EAEFF',
      badgeInkHover: '#0091E2',
      badgeShadow: '0 8px 13.5px rgba(49, 59, 67, 0.14)',
      pathInk: '#1A1C1E',
      pathInkHover: '#1A1C1E',
      descInk: '#404142',
      chevronInk: '#1B2327',
      rowHoverShadow: '0 4px 9px rgba(30, 185, 255, 0.18)',
    });
  });

  it('maps PUT to the yellow accent recipe', () => {
    const r: RowRecipe = resolveRecipe('put', false);
    expect(r).toMatchObject({
      accent: '#FFC01E',
      accentHover: '#DD9F00',
      tint: 'rgba(255, 192, 30, 0.1)',
      badgeInk: '#FFC01E',
      badgeInkHover: '#DD9F00',
      badgeShadow: '0 8px 13.5px rgba(255, 122, 0, 0.48)',
      rowHoverShadow: '0 4px 9px rgba(221, 168, 55, 0.18)',
    });
  });

  it('maps POST to the green accent recipe', () => {
    const r: RowRecipe = resolveRecipe('post', false);
    expect(r).toMatchObject({
      accent: '#38B386',
      accentHover: '#00AE70',
      tint: 'rgba(56, 179, 134, 0.1)',
      badgeInk: '#38B386',
      badgeInkHover: '#00AE70',
      badgeShadow: '0 8px 13.5px rgba(54, 185, 137, 0.43)',
      rowHoverShadow: '0 4px 9px rgba(75, 157, 71, 0.18)',
    });
  });

  it('maps DELETE to the red accent recipe', () => {
    const r: RowRecipe = resolveRecipe('delete', false);
    expect(r).toMatchObject({
      accent: '#DC3939',
      accentHover: '#FF2F2F',
      tint: 'rgba(220, 57, 57, 0.1)',
      badgeInk: '#DC3939',
      badgeInkHover: '#FF2F2F',
      badgeShadow: '0 8px 13.5px #F4B0B0',
      rowHoverShadow: '0 4px 9px rgba(199, 44, 44, 0.18)',
    });
  });

  it('swaps the whole recipe to grey when muted, regardless of method', () => {
    const r: RowRecipe = resolveRecipe('get', true);
    expect(r).toEqual({
      accent: '#E1E7EA',
      accentHover: '#E1E7EA',
      tint: '#f4f5f6',
      badgeInk: '#969B9D',
      badgeInkHover: '#1C2022',
      badgeShadow: '0 8px 13.5px rgba(49, 59, 67, 0.14)',
      pathInk: '#969B9D',
      pathInkHover: '#1C2022',
      descInk: '#D0D4D8',
      chevronInk: '#E1E7EA',
      rowHoverShadow: '0 4px 9px rgba(106, 106, 106, 0.18)',
    });
  });
});

// `rowContainerSx` is typed as the broad `SxProps` union; in practice it always
// returns the `[base, ...consumerSx]` array. Narrow it once here so the layer
// assertions can index into the produced style objects.
type SxLayers = Record<string, unknown>[];
function layersOf(config: Parameters<typeof rowContainerSx>[0]): SxLayers {
  return rowContainerSx(config) as SxLayers;
}

describe('rowContainerSx — layout / interactive / expanded assembly', () => {
  const recipe: RowRecipe = resolveRecipe('get', false);

  it('bakes the recipe border + tint and the child ink/shadow rules', () => {
    const [base] = layersOf({ recipe, interactive: false, expanded: false, sx: undefined });
    expect(base.borderColor).toBe('#1EAEFF');
    expect(base.backgroundColor).toBe('rgba(30, 174, 255, 0.1)');
    expect(base['& .ui-item-row__badge']).toEqual({
      color: '#1EAEFF',
      boxShadow: '0 8px 13.5px rgba(49, 59, 67, 0.14)',
      // On mobile the transparent badge trades box-shadow (a smudge behind the
      // glyphs) for a glyph-hugging drop-shadow filter derived from the same value.
      '@media (max-width: 480px)': {
        boxShadow: 'none',
        filter: 'drop-shadow(0 8px 13.5px rgba(49, 59, 67, 0.14))',
      },
    });
    expect(base['& .ui-item-row__path']).toEqual({ color: '#1A1C1E' });
    expect(base['& .ui-item-row__description']).toEqual({ color: '#404142' });
    expect(base['& .ui-item-row__chevron']).toEqual({ color: '#1B2327' });
  });

  it('omits the interactive block for a static row', () => {
    const [base] = layersOf({ recipe, interactive: false, expanded: false, sx: undefined });
    expect(base.cursor).toBeUndefined();
    expect(base['&:hover']).toBeUndefined();
    expect(base['&:focus-visible']).toBeUndefined();
  });

  it('adds pointer cursor, the hover recipe and the inset focus ring for a button', () => {
    const [base] = layersOf({ recipe, interactive: true, expanded: false, sx: undefined });
    expect(base.cursor).toBe('pointer');
    expect(base['&:hover']).toEqual({
      borderColor: '#0091E2',
      boxShadow: '0 4px 9px rgba(30, 185, 255, 0.18)',
      '& .ui-item-row__badge': { color: '#0091E2' },
      '& .ui-item-row__path': { color: '#1A1C1E' },
    });
    expect(base['&:focus-visible']).toEqual({
      outline: 'none',
      boxShadow: 'inset 0 0 0 2px #1A1C1E',
    });
  });

  it('flips + accent-tints the chevron only when expanded', () => {
    const [collapsed] = layersOf({ recipe, interactive: true, expanded: false, sx: undefined });
    expect(collapsed['& .ui-item-row__chevron']).toEqual({ color: '#1B2327' });

    const [expanded] = layersOf({ recipe, interactive: true, expanded: true, sx: undefined });
    expect(expanded['& .ui-item-row__chevron']).toEqual({
      color: '#1EAEFF',
      transform: 'rotate(180deg)',
    });
  });

  it('appends an object sx after the base layer', () => {
    const result: SxLayers = layersOf({
      recipe,
      interactive: false,
      expanded: false,
      sx: { marginTop: '1rem' },
    });
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ marginTop: '1rem' });
  });

  it('spreads an array sx after the base layer', () => {
    const result: SxLayers = layersOf({
      recipe,
      interactive: false,
      expanded: false,
      sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }],
    });
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ marginTop: '1rem' });
    expect(result[2]).toEqual({ paddingTop: '2rem' });
  });
});

describe('iconGroupSx — optical offset', () => {
  it('nudges the trailing icon group 2px up so the glyphs sit 1px above centre', () => {
    // Figma draws the icons a hair high; the 2px bottom margin reproduces the
    // 13px (desktop) / 15px (mobile) top offset. Pin it exactly (mutation-killing).
    expect(iconGroupSx as Record<string, unknown>).toMatchObject({ marginBottom: '2px' });
  });
});

describe('useItemRow — disclosure view model', () => {
  it('marks an unwired row non-interactive with all aria fields absent', () => {
    const { result } = renderHook(() => useItemRow({ method: 'get', path: '/pet' }));
    const model: ItemRowModel = result.current;
    expect(model.interactive).toBe(false);
    expect(model.ariaExpanded).toBeUndefined();
    expect(model.ariaControls).toBeUndefined();
    expect(model.ariaDisabled).toBeUndefined();
  });

  it('does not throw when an unwired row is activated (no onToggle to call)', () => {
    const { result } = renderHook(() => useItemRow({ method: 'get', path: '/pet' }));
    expect(() => result.current.onActivate()).not.toThrow();
  });

  it('fires onToggle once for a wired, non-muted activation', () => {
    const onToggle: jest.Mock = jest.fn();
    const { result } = renderHook(() => useItemRow({ method: 'get', path: '/pet', onToggle }));
    result.current.onActivate();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('swallows activation while muted so onToggle never fires', () => {
    const onToggle: jest.Mock = jest.fn();
    const { result } = renderHook(() =>
      useItemRow({ method: 'get', path: '/pet', muted: true, onToggle })
    );
    result.current.onActivate();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('keeps aria-controls absent when expanded but no panelId is given', () => {
    const { result } = renderHook(() =>
      useItemRow({ method: 'get', path: '/pet', expanded: true, onToggle: noop })
    );
    expect(result.current.ariaExpanded).toBe(true);
    expect(result.current.ariaControls).toBeUndefined();
  });

  it('emits aria-controls when interactive, expanded and given a panelId', () => {
    const { result } = renderHook(() =>
      useItemRow({ method: 'get', path: '/pet', expanded: true, panelId: 'p1', onToggle: noop })
    );
    expect(result.current.ariaControls).toBe('p1');
  });

  it('sets aria-disabled only for a muted wired row', () => {
    const { result } = renderHook(() =>
      useItemRow({ method: 'get', path: '/pet', muted: true, onToggle: noop })
    );
    expect(result.current.ariaDisabled).toBe(true);
  });
});
