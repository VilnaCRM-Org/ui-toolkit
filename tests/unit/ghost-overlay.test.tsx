import { render } from '@testing-library/react';
import React from 'react';

import { GhostOverlay } from '../../src/components/ghost-overlay';

import firstOf from './utils/first-of';
import nthOf from './utils/nth-of';

// Emotion injects `sx` straight into the CSSOM, so the declarations it emitted for
// an element are only reachable through `document.styleSheets` — the injected
// <style> nodes carry no text of their own.
function emittedCss(element: Element): string {
  const emotionClass: string | undefined = Array.from(element.classList).find(
    (name: string): boolean => name.startsWith('css-')
  );
  if (emotionClass === undefined) return '';
  let css: string = '';
  Array.from(document.styleSheets).forEach((sheet: CSSStyleSheet): void => {
    Array.from(sheet.cssRules).forEach((rule: CSSRule): void => {
      if (rule.cssText.includes(emotionClass)) css += rule.cssText;
    });
  });
  return css;
}

// The overlay and its runs are pure paint — aria-hidden, no role, no accessible
// name — so their class hooks are the only handle a test has on them.
function overlayIn(container: HTMLElement): Element {
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const root: Element | null = container.querySelector('.ui-ghost-overlay');
  if (root === null) throw new Error('GhostOverlay rendered no overlay root');
  return root;
}

function runsIn(container: HTMLElement): Element[] {
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  return [...container.querySelectorAll('.ui-ghost-run')];
}

describe('GhostOverlay', () => {
  it('renders the typed prefix and the grey completion as separate runs', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const runs = [...container.querySelectorAll('.ui-ghost-run')].map(s => s.textContent);
    // A transparent typed mirror, then the grey completion.
    expect(runs).toEqual(['Top', ' performers']);
  });

  it('is hidden from assistive technology so the completion is never announced', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const root = container.querySelector('.ui-ghost-overlay');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveTextContent('Top performers');
  });

  it('draws no custom caret — the input keeps its own native caret', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.ui-ghost-caret')).toBeNull();
  });

  it('renders nothing when there is no completion', () => {
    const { container } = render(<GhostOverlay typed="Top performers" completion="" />);
    expect(container).toBeEmptyDOMElement();
  });

  // Every expected value below is spelled out as a literal rather than read back
  // off the source: an expectation that imports the token it checks passes
  // whatever that token becomes.
  it('lays the overlay over the field as a non-interactive flex row', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);

    const css: string = emittedCss(overlayIn(container));
    // Absolutely positioned inside the field's own positioned wrapper — static
    // positioning would push the completion onto its own line below the input.
    expect(css).toContain('position: absolute');
    // One row, the two runs centred on the value's optical middle.
    expect(css).toContain('display: flex');
    expect(css).toContain('align-items: center');
    // The 2px gap is the room the input's native caret occupies at the typed-text
    // end; without it the grey completion is drawn under the caret.
    expect(css).toContain('gap: 2px');
    // Clicks and drags must reach the input underneath, never this layer.
    expect(css).toContain('pointer-events: none');
  });

  it('keeps the typed mirror invisible so the real value is never doubled', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);

    const css: string = emittedCss(firstOf(runsIn(container)));
    // The mirror exists only to reserve the typed text's width; the field's own
    // dark text is what the user reads.
    expect(css).toContain('color: transparent');
    // Windows High Contrast forces `transparent` opaque, which would print the
    // value twice — opting the mirror out keeps it invisible there (a11y M2).
    expect(css).toContain('forced-color-adjust: none');
    // `pre` keeps the mirror exactly as wide as what was typed; collapsing a run
    // of spaces would shift the completion left, under the last typed letters.
    expect(css).toContain('white-space: pre');
  });

  it('paints the completion in the grey-300 suggestion ink', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);

    const css: string = emittedCss(nthOf(runsIn(container), 1));
    // Figma's grey-300, written out so a token edit cannot slip through silently.
    expect(css).toMatch(/color: #969b9d/i);
    // The completion opens with a space, which only `pre` preserves.
    expect(css).toContain('white-space: pre');
  });

  it('falls back to the system muted ink under forced colors', () => {
    const { container } = render(<GhostOverlay typed="Top" completion=" performers" />);

    const css: string = emittedCss(nthOf(runsIn(container), 1));
    // High Contrast discards the grey, so without this block the completion would
    // read as committed input rather than a suggestion (a11y review M2).
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain('color: GrayText');
  });

  it('measures itself against the input it overlays as soon as it mounts', () => {
    // The overlay ships as a sibling of the field's input inside a positioned
    // wrapper. Skip the alignment on mount and the completion sits at the
    // wrapper's origin instead of at the input's text start.
    const { container } = render(
      <div>
        <input aria-label="Search" readOnly value="Top" style={{ paddingLeft: '17px' }} />
        <GhostOverlay typed="Top" completion=" performers" />
      </div>
    );

    // jsdom performs no layout, so every rect is 0 and the written left offset is
    // purely the input's folded 17px padding — never the stylesheet's own 0.
    expect(overlayIn(container)).toHaveStyle({ left: '17px' });
  });
});
