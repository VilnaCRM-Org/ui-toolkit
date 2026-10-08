import { render, screen } from '@testing-library/react';
import React from 'react';

import { sharedPalette } from '../../src/components/ui-color-theme';
import UiLink from '../../src/components/ui-link';
import { accessibleLinkPalette } from '../../src/components/ui-link/styles';
import type { UiLinkProps } from '../../src/components/ui-link/types';
import { fontFamilies } from '../../src/utils/font-tokens';

import { emotionCssFor } from './utils/emotion-css';

const NAME: string = 'Забули пароль?';
const TABLET_QUERY: string = '@media(min-width:768px)and(max-width:1439.95px)';
const TABLET_DECLARATIONS: string = '{font-size:1.125rem;font-weight:600;line-height:normal;}}';

type LinkOptions = Pick<UiLinkProps, 'tone' | 'underline' | 'responsiveSize' | 'disabled'>;

function renderTextLink({ tone, underline, responsiveSize, disabled }: LinkOptions = {}): void {
  render(
    <UiLink
      href="/reset"
      appearance="text"
      tone={tone}
      underline={underline}
      responsiveSize={responsiveSize}
      disabled={disabled}
    >
      {NAME}
    </UiLink>
  );
}

function link(): HTMLElement {
  return screen.getByRole('link', { name: NAME });
}

function compactCss(): string {
  return emotionCssFor(link()).replace(/\s+/g, '');
}

function ruleBodies(selectorTail: string): string[] {
  return compactCss()
    .split('}')
    .filter((chunk: string): boolean => chunk.includes(`${selectorTail}{`))
    .map((chunk: string): string => chunk.slice(chunk.lastIndexOf('{') + 1))
    .map((body: string): string => body.replace(/-webkit-text-decoration:[a-z]+;/g, ''));
}

describe('UiLink appearance="text" at rest', () => {
  it('paints the Figma Primary ink with Golos 500 15px/18px and no underline', () => {
    renderTextLink();

    expect(link()).toHaveStyle({
      color: sharedPalette.primary.main,
      fontFamily: fontFamilies.golos,
      fontSize: '0.9375rem',
      fontWeight: '500',
      lineHeight: '1.125rem',
      textDecoration: 'none',
    });
    expect(compactCss()).toContain('letter-spacing:0;');
  });

  it('switches to Golos 600 18px/normal between the md and xl breakpoints', () => {
    renderTextLink();

    const css: string = compactCss();
    const start: number = css.indexOf(`${TABLET_QUERY}{.`);
    const block: string = css.slice(start, css.indexOf('}}', start) + 2);

    expect(start).toBeGreaterThan(-1);
    expect(block.endsWith(TABLET_DECLARATIONS)).toBe(true);
  });

  it('drops the default link font-size media rules', () => {
    renderTextLink();

    const css: string = compactCss();
    expect(css).not.toContain('max-width:1130px');
    expect(css).not.toContain('max-width:640px');
  });

  it('keeps 15px/18px at every width with responsiveSize={false}', () => {
    renderTextLink({ responsiveSize: false });

    expect(compactCss()).not.toContain('@media');
    expect(link()).toHaveStyle({ fontSize: '0.9375rem', lineHeight: '1.125rem' });
  });
});

describe('UiLink appearance="text" interaction cues', () => {
  it('underlines on hover', () => {
    renderTextLink();

    expect(ruleBodies(':hover')).toContain('text-decoration:underline;');
  });

  it('underlines and outlines focus 2px in the text-primary token, offset 2px', () => {
    renderTextLink();

    expect(ruleBodies(':focus')).toEqual([
      'text-decoration:underline;outline:2pxsolid#404142;outline-offset:2px;',
    ]);
  });

  it('drops the ring and the underline on pointer focus where focus-visible is supported', () => {
    renderTextLink();

    expect(ruleBodies(':focus:not(:focus-visible)')).toEqual(['outline:none;']);
    expect(ruleBodies(':focus:not(:focus-visible):not(:hover)')).toEqual(['text-decoration:none;']);
  });

  it('keeps the underline on pointer focus when the link is underlined at rest', () => {
    renderTextLink({ underline: 'always' });

    expect(compactCss()).not.toContain(':not(:hover)');
  });

  it('keeps the brand hover and press inks', () => {
    renderTextLink();

    const css: string = compactCss();
    expect(css).toContain(`:hover{color:${sharedPalette.textLinkHover.main};}`);
    expect(css).toContain(`:active{color:${sharedPalette.textLinkActive.main};}`);
  });
});

describe('UiLink appearance="text" composition', () => {
  it('lets an explicit underline override the text default', () => {
    renderTextLink({ underline: 'always' });

    expect(link()).toHaveStyle({ textDecoration: 'underline', fontSize: '0.9375rem' });
  });

  it('composes with tone="accessible" for a 4.5:1 ink', () => {
    renderTextLink({ tone: 'accessible' });

    expect(link()).toHaveStyle({
      color: accessibleLinkPalette.rest,
      fontFamily: fontFamilies.golos,
      fontWeight: '500',
    });
  });

  it('inherits the surrounding ink with tone="inherit"', () => {
    renderTextLink({ tone: 'inherit' });

    const css: string = compactCss();
    expect(css).not.toContain(`color:${sharedPalette.primary.main}`);
    expect(css).toContain('font-size:0.9375rem');
  });

  it('keeps the disabled ink and contract on a text link', () => {
    renderTextLink({ disabled: true });

    expect(link()).toHaveAttribute('aria-disabled', 'true');
    expect(link()).toHaveStyle({ color: sharedPalette.brandGray.main, textDecoration: 'none' });
  });
});

describe('UiLink default appearance is unchanged', () => {
  it.each([undefined, 'default' as const])('renders Inter 700 underlined for %s', appearance => {
    render(
      <UiLink href="/reset" appearance={appearance}>
        {NAME}
      </UiLink>
    );

    expect(link()).toHaveStyle({
      fontFamily: fontFamilies.inter,
      fontWeight: '700',
      fontSize: '0.875rem',
      textDecoration: 'underline',
    });
    const css: string = compactCss();
    expect(css).toContain('max-width:1130px');
    expect(css).not.toContain(TABLET_QUERY);
  });
});
