import { ThemeProvider, createTheme } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { UiLink } from '../../src/components';

import { testText, testUrl } from './constants';

describe('UiLink', () => {
  it('renders the Link with the provided children and href', () => {
    const testHref: string = testUrl;
    render(<UiLink href={testHref}>{testText}</UiLink>);
    const linkElement: HTMLElement = screen.getByText(testText);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', testHref);
  });

  it('adds a safe rel value for links that open in a new tab', () => {
    render(
      <UiLink href={testUrl} target="_blank">
        {testText}
      </UiLink>
    );

    // UiLink appends a visually-hidden "(opens in new tab)" notice for new-tab
    // links, so the accessible name contains — but is not exactly — the text.
    expect(screen.getByRole('link', { name: new RegExp(testText) })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('does not add a rel value for links that stay in the same tab', () => {
    render(<UiLink href={testUrl}>{testText}</UiLink>);

    expect(screen.getByRole('link', { name: testText })).not.toHaveAttribute('rel');
  });

  it('uses an explicit rel prop instead of computing one for same-tab links', () => {
    render(
      <UiLink href={testUrl} rel="nofollow">
        {testText}
      </UiLink>
    );

    // The caller-provided rel takes precedence over the (undefined) computed value.
    expect(screen.getByRole('link', { name: testText })).toHaveAttribute('rel', 'nofollow');
  });

  it('merges noopener/noreferrer into an explicit rel for new-tab links', () => {
    render(
      <UiLink href={testUrl} target="_blank" rel="nofollow">
        {testText}
      </UiLink>
    );

    // A custom rel is preserved but noopener/noreferrer are always enforced for
    // new-tab links (anti tab-nabbing), rather than the custom rel replacing them.
    expect(screen.getByRole('link', { name: new RegExp(testText) })).toHaveAttribute(
      'rel',
      'nofollow noopener noreferrer'
    );
  });

  it('omits the new-tab notice when newTabLabel is an empty string', () => {
    render(
      <UiLink href={testUrl} target="_blank" newTabLabel="">
        {testText}
      </UiLink>
    );

    // An empty newTabLabel suppresses the visually-hidden hint, so the accessible
    // name is exactly the children with no appended notice.
    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // No semantic query exists for "no appended notice span"; assert its absence by structure.
    // eslint-disable-next-line testing-library/no-node-access
    expect(link.querySelector('span')).toBeNull();
  });

  it('applies base link styles when custom sx is not provided', () => {
    render(<UiLink href={testUrl}>{testText}</UiLink>);

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
    });
  });

  it('merges base link styles with object sx props', () => {
    render(
      <UiLink href={testUrl} sx={{ textTransform: 'uppercase' }}>
        {testText}
      </UiLink>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
      textTransform: 'uppercase',
    });
  });

  it('merges base link styles with array sx props', () => {
    render(
      <UiLink href={testUrl} sx={[{ letterSpacing: '0.125rem' }]}>
        {testText}
      </UiLink>
    );

    expect(screen.getByRole('link', { name: testText })).toHaveStyle({
      fontWeight: '700',
      letterSpacing: '0.125rem',
    });
  });

  it('applies its own MuiLink theme regardless of parent theme overrides', () => {
    const parentTheme: ReturnType<typeof createTheme> = createTheme({
      components: {
        MuiLink: {
          defaultProps: {
            underline: 'none',
          },
        },
      },
    });

    render(
      <ThemeProvider theme={parentTheme}>
        <UiLink href={testUrl}>{testText}</UiLink>
      </ThemeProvider>
    );

    // UiLink wraps its own ThemeProvider, so the parent's `underline: 'none'`
    // default is not inherited; its own theme (fontWeight 700, underline) wins.
    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveClass('MuiLink-root');
    expect(link).not.toHaveClass('MuiLink-underlineNone');
    expect(link).toHaveStyle({ fontWeight: '700' });
  });
});

const getElementCss = (element: HTMLElement): string => {
  const emotionClass: string | undefined = Array.from(element.classList).find(
    (className: string): boolean => className.startsWith('css-')
  );
  if (!emotionClass) {
    return '';
  }
  let css: string = '';
  // eslint-disable-next-line testing-library/no-node-access
  Array.from(document.querySelectorAll('style')).forEach((styleEl: Element): void => {
    const sheet: CSSStyleSheet | null = (styleEl as HTMLStyleElement).sheet;
    if (!sheet) {
      return;
    }
    Array.from(sheet.cssRules).forEach((rule: CSSRule): void => {
      if (rule.cssText.includes(emotionClass)) {
        css += rule.cssText;
      }
    });
  });
  return css;
};

const getNewTabLink = (label?: string): HTMLElement => {
  if (label === undefined) {
    render(
      <UiLink href={testUrl} target="_blank">
        {testText}
      </UiLink>
    );
  } else {
    render(
      <UiLink href={testUrl} target="_blank" newTabLabel={label}>
        {testText}
      </UiLink>
    );
  }
  return screen.getByRole('link');
};

const getNoticeSpan = (link: HTMLElement): HTMLElement | null =>
  // eslint-disable-next-line testing-library/no-node-access
  link.querySelector('span');

describe('UiLink new-tab notice (default label)', () => {
  it('appends the default "(opens in new tab)" notice for new-tab links', () => {
    // Kills StringLiteral default newTabLabel = '(opens in new tab)' -> ''.
    const link: HTMLElement = getNewTabLink();
    expect(link).toHaveAccessibleName(`${testText} (opens in new tab)`);
  });

  it('renders the visually-hidden notice span for new-tab links', () => {
    // Kills ConditionalExpression {opensInNewTab && newTabLabel ? ... : null} -> {false ? ...}.
    const link: HTMLElement = getNewTabLink();
    const span: HTMLElement | null = getNoticeSpan(link);
    expect(span).not.toBeNull();
    expect(span).toHaveTextContent('(opens in new tab)');
  });

  it('includes a leading space before the notice text', () => {
    // Kills StringLiteral {` ${newTabLabel}`} -> {``} (the appended text content).
    const link: HTMLElement = getNewTabLink();
    const span: HTMLElement | null = getNoticeSpan(link);
    expect(span?.textContent).toBe(' (opens in new tab)');
  });

  it('uses a caller-provided newTabLabel verbatim', () => {
    const link: HTMLElement = getNewTabLink('external');
    const span: HTMLElement | null = getNoticeSpan(link);
    expect(span?.textContent).toBe(' external');
    expect(link).toHaveAccessibleName(`${testText} external`);
  });
});

describe('UiLink visually-hidden notice styles', () => {
  it('applies every visually-hidden style to the notice span', () => {
    // Kills ObjectLiteral visuallyHidden -> {} and the per-property StringLiteral -> ''
    // mutations for position/width/height/margin/overflow/whiteSpace.
    const link: HTMLElement = getNewTabLink();
    const span: HTMLElement | null = getNoticeSpan(link);
    expect(span).not.toBeNull();
    expect(span).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    });
  });

  it('clips the notice span out of the visual flow with rect(0 0 0 0)', () => {
    // Kills StringLiteral clip: 'rect(0 0 0 0)' -> ''. jsdom getComputedStyle and
    // jest-dom toHaveStyle cannot distinguish clip here (both spuriously match), so we
    // read the emotion-generated CSS rule for the span and assert the literal value.
    const link: HTMLElement = getNewTabLink();
    const span: HTMLElement | null = getNoticeSpan(link);
    expect(span).not.toBeNull();
    const css: string = getElementCss(span as HTMLElement);
    expect(css).toMatch(/clip:\s*rect\(0 0 0 0\)/);
  });
});

// Renders the link with `disabled` omitted (undefined) or explicitly set, and
// returns the anchor. The anchor keeps its `link` role in every case, because
// UiLink never drops `href`.
const getLink = (disabled?: boolean): HTMLElement => {
  if (disabled === undefined) {
    render(<UiLink href={testUrl}>{testText}</UiLink>);
  } else {
    render(
      <UiLink href={testUrl} disabled={disabled}>
        {testText}
      </UiLink>
    );
  }
  return screen.getByRole('link', { name: testText });
};

describe('UiLink disabled state', () => {
  it('keeps the link role, href and accessible name while disabled', () => {
    // Dropping href would strip the `link` role and the accessible name, so the
    // disabled treatment is layered on top of a still-complete anchor.
    expect(getLink(true)).toHaveAttribute('href', testUrl);
  });

  it('flags a disabled link with aria-disabled', () => {
    // Kills ConditionalExpression {disabled ? true : undefined} -> {false ? ...}.
    expect(getLink(true)).toHaveAttribute('aria-disabled', 'true');
  });

  it('leaves a link without aria-disabled when disabled is omitted', () => {
    // Kills ConditionalExpression {disabled ? true : undefined} -> {true ? ...}.
    expect(getLink()).not.toHaveAttribute('aria-disabled');
  });

  it('leaves a link without aria-disabled when disabled is explicitly false', () => {
    expect(getLink(false)).not.toHaveAttribute('aria-disabled');
  });

  it('removes a disabled link from the tab order with tabIndex -1', () => {
    // Kills ConditionalExpression {disabled ? -1 : undefined} -> {false ? ...}
    // and the UnaryOperator mutation of -1.
    expect(getLink(true)).toHaveAttribute('tabindex', '-1');
  });

  it('leaves an enabled link at its natural tab position', () => {
    // Kills ConditionalExpression {disabled ? -1 : undefined} -> {true ? ...}.
    expect(getLink()).not.toHaveAttribute('tabindex');
  });

  it('suppresses navigation when a disabled link is clicked', () => {
    // fireEvent returns false when a listener called preventDefault on the
    // cancelable click, i.e. the browser would not follow the href.
    // Kills ConditionalExpression {disabled ? suppressNavigation : undefined}
    // -> {false ? ...} and the MethodExpression removal of preventDefault().
    expect(fireEvent.click(getLink(true))).toBe(false);
  });

  it('lets an enabled link navigate on click', () => {
    // Kills ConditionalExpression {disabled ? suppressNavigation : undefined}
    // -> {true ? ...}: an enabled link must not cancel its own activation.
    expect(fireEvent.click(getLink())).toBe(true);
  });

  it('paints the disabled link with the brand-gray token from Board A', () => {
    // Board A's Disabled column (`439:19364`, `439:19614`) measures #E1E7EA
    // (brandGray) against the rest column's #969B9D. jsdom serialises colours
    // inconsistently, so both notations are accepted.
    const css: string = getElementCss(getLink(true));
    expect(css).toMatch(
      /\[aria-disabled="true"\][^{]*\{[^}]*color:\s*(#e1e7ea|rgb\(225,\s*231,\s*234\))/i
    );
  });

  it('keeps the underline treatment while disabled', () => {
    // The measured disabled and rest glyphs share their typography: the board
    // changes the ink only, so no decoration override is emitted.
    expect(getLink(true)).toHaveStyle({ textDecoration: 'underline' });
  });

  it('still enforces the new-tab rel and notice when disabled', () => {
    render(
      <UiLink href={testUrl} target="_blank" disabled>
        {testText}
      </UiLink>
    );

    const link: HTMLElement = screen.getByRole('link', { name: new RegExp(testText) });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAccessibleName(`${testText} (opens in new tab)`);
  });
});
