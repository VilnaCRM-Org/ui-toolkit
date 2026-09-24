import type { SxProps, Theme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiSxAdapter from '../../src/components/ui-sx-adapter';
import { flattenToInline, resolveSxLayers } from '../../src/components/ui-sx-adapter/resolve-sx';
import type { UiSxAdapterRenderProps } from '../../src/components/ui-sx-adapter/types';
import { uiTheme } from '../../src/utils/ui-theme';

const BRAND_HEX: string = uiTheme.palette.primary.main;
const BRAND_RGB: string = 'rgb(30, 174, 255)';
const DROPPED_RULES_WARNING: string =
  '[ui-toolkit] UiSxAdapter received `inline` with rules an inline style cannot express ' +
  '(&:hover, @media print); they were dropped. Render without `inline` to keep them.';

type ChildMock = jest.Mock<React.ReactNode, [UiSxAdapterRenderProps]>;

function childMock(): ChildMock {
  return jest.fn<React.ReactNode, [UiSxAdapterRenderProps]>(() => null);
}

function panelChild({ className, style }: UiSxAdapterRenderProps): React.ReactElement {
  return <div role="group" aria-label="panel" className={className} style={style} />;
}

function panel(): HTMLElement {
  return screen.getByRole('group', { name: 'panel' });
}

function stylesheetText(): string {
  return Array.from(document.styleSheets)
    .flatMap(sheet => Array.from(sheet.cssRules))
    .map(rule => rule.cssText)
    .join('\n');
}

function mountInline(sx: SxProps<Theme>, child: ChildMock = childMock()): ChildMock {
  render(
    <UiSxAdapter sx={sx} inline className="consumer">
      {child}
    </UiSxAdapter>
  );
  return child;
}

describe('UiSxAdapter — without sx', () => {
  it('passes the caller className and style through untouched', () => {
    const child: ChildMock = childMock();

    render(
      <UiSxAdapter className="consumer" style={{ opacity: 0.5 }}>
        {child}
      </UiSxAdapter>
    );

    expect(child).toHaveBeenCalledWith({ className: 'consumer', style: { opacity: 0.5 } });
  });

  it('hands the child nothing when the caller gives nothing', () => {
    const child: ChildMock = childMock();

    render(<UiSxAdapter>{child}</UiSxAdapter>);

    expect(child).toHaveBeenCalledWith({ className: undefined, style: undefined });
  });

  it('treats a null sx as absent, in inline mode too', () => {
    const child: ChildMock = childMock();

    render(
      <UiSxAdapter sx={null} inline className="consumer">
        {child}
      </UiSxAdapter>
    );

    expect(child).toHaveBeenCalledWith({ className: 'consumer', style: undefined });
  });

  it('renders what the child returns', () => {
    render(<UiSxAdapter>{panelChild}</UiSxAdapter>);

    expect(panel()).not.toHaveAttribute('class');
  });
});

describe('UiSxAdapter — class-name mode', () => {
  it('resolves theme tokens into a class on a plain element', () => {
    render(
      <UiSxAdapter sx={{ color: 'primary.main', p: 2, bgcolor: 'backgroundGrey100.main' }}>
        {panelChild}
      </UiSxAdapter>
    );

    expect(panel()).toHaveStyle({
      color: BRAND_RGB,
      padding: '16px',
      backgroundColor: 'rgb(251, 251, 251)',
    });
  });

  it('puts the generated class first and keeps the caller class after it', () => {
    const child: ChildMock = childMock();

    render(
      <UiSxAdapter sx={{ color: 'primary.main' }} className="consumer" style={{ opacity: 0.5 }}>
        {child}
      </UiSxAdapter>
    );

    const [[props]] = child.mock.calls as [[UiSxAdapterRenderProps]];
    expect(props.className).toMatch(/^css-\S+ consumer$/);
    expect(props.style).toEqual({ opacity: 0.5 });
  });

  it('emits no caller class when none is given', () => {
    const child: ChildMock = childMock();

    render(<UiSxAdapter sx={{ color: 'primary.main' }}>{child}</UiSxAdapter>);

    const [[props]] = child.mock.calls as [[UiSxAdapterRenderProps]];
    expect(props.className).toMatch(/^css-\S+$/);
    expect(props.style).toBeUndefined();
  });

  it('resolves array sx in order and skips falsy entries', () => {
    const isCompact: boolean = false;
    render(
      <UiSxAdapter sx={[{ color: 'primary.main', p: 1 }, isCompact && { p: 4 }, { p: 3 }]}>
        {panelChild}
      </UiSxAdapter>
    );

    expect(panel()).toHaveStyle({ color: BRAND_RGB, padding: '24px' });
  });

  it('calls a function sx with the toolkit theme', () => {
    render(
      <UiSxAdapter sx={theme => ({ color: theme.palette.error.main })}>{panelChild}</UiSxAdapter>
    );

    expect(panel()).toHaveStyle({ color: 'rgb(220, 57, 57)' });
  });

  it('keeps pseudo-class and breakpoint rules in the generated stylesheet', () => {
    render(
      <UiSxAdapter sx={{ '&:hover': { color: 'primary.main' }, width: { md: '20rem' } }}>
        {panelChild}
      </UiSxAdapter>
    );

    const css: string = stylesheetText();
    expect(css).toMatch(new RegExp(`:hover\\s*\\{\\s*color:\\s*${BRAND_HEX};?\\s*\\}`, 'i'));
    expect(css).toContain(`min-width:${uiTheme.breakpoints.values.md}px`);
  });
});

describe('UiSxAdapter — inline mode', () => {
  it('resolves theme tokens into a flat style and keeps the caller class', () => {
    const child: ChildMock = mountInline({ color: 'primary.main', p: 2 });

    expect(child).toHaveBeenCalledWith({
      className: 'consumer',
      style: { color: BRAND_HEX, padding: '16px' },
    });
  });

  it('lets the caller style win over the resolved one', () => {
    const child: ChildMock = childMock();

    render(
      <UiSxAdapter sx={{ color: 'primary.main', p: 2 }} inline style={{ color: 'red' }}>
        {child}
      </UiSxAdapter>
    );

    expect(child).toHaveBeenCalledWith({
      className: undefined,
      style: { color: 'red', padding: '16px' },
    });
  });

  it('applies the resolved style to the element', () => {
    render(
      <UiSxAdapter sx={{ color: 'primary.main', p: 2 }} inline>
        {panelChild}
      </UiSxAdapter>
    );

    expect(panel()).toHaveStyle({ color: BRAND_RGB, padding: '16px' });
    expect(panel()).not.toHaveAttribute('class');
  });

  it('drops nested rules and warns once, naming each of them', () => {
    const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sx: SxProps<Theme> = {
      color: 'primary.main',
      '&:hover': { color: 'error.main' },
      '@media print': { display: 'none' },
    };
    const child: ChildMock = childMock();
    const { rerender } = render(
      <UiSxAdapter sx={sx} inline>
        {child}
      </UiSxAdapter>
    );
    rerender(
      <UiSxAdapter sx={sx} inline>
        {child}
      </UiSxAdapter>
    );

    expect(child).toHaveBeenLastCalledWith({ className: undefined, style: { color: BRAND_HEX } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(DROPPED_RULES_WARNING);
    warn.mockRestore();
  });

  it('stays silent when every rule fits in an inline style', () => {
    const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mountInline({ color: 'primary.main', m: 1 });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('lets a later array layer win and names a repeated nested rule once', () => {
    const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const child: ChildMock = mountInline([
      { color: 'primary.main', '&:hover': { color: 'red' } },
      { color: 'error.main', '&:hover': { color: 'blue' } },
    ]);

    expect(child).toHaveBeenCalledWith({
      className: 'consumer',
      style: { color: uiTheme.palette.error.main },
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('(&:hover);'));
    warn.mockRestore();
  });
});

describe('resolveSxLayers', () => {
  it('wraps an object sx in a single resolved layer', () => {
    expect(resolveSxLayers({ p: 1 }, uiTheme)).toEqual([{ padding: '8px' }]);
  });

  it('drops null and false layers from an array sx', () => {
    expect(resolveSxLayers([null, false, { m: 1 }], uiTheme)).toEqual([{ margin: '8px' }]);
  });

  it('returns no layer for a function sx that resolves to null', () => {
    expect(resolveSxLayers(() => null, uiTheme)).toEqual([]);
  });
});

describe('flattenToInline', () => {
  it('keeps primitive declarations and lists nested rules in first-seen order', () => {
    expect(
      flattenToInline([
        { color: 'red', '&:focus': { color: 'blue' } },
        { opacity: 0.5, '&:hover': { color: 'green' }, '&:focus': { color: 'black' } },
      ])
    ).toEqual({ style: { color: 'red', opacity: 0.5 }, droppedRules: ['&:focus', '&:hover'] });
  });

  it('returns an empty style for no layers', () => {
    expect(flattenToInline([])).toEqual({ style: {}, droppedRules: [] });
  });
});
