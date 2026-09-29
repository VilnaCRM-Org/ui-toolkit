import { render, screen } from '@testing-library/react';
import React from 'react';

import UiButton from '../../src/components/ui-button';
import { sharedPalette } from '../../src/components/ui-color-theme';

import { emotionCssFor } from './utils/emotion-css';

const RING: RegExp = new RegExp(
  `:focus-visible\\s*\\{[^}]*outline:\\s*2px solid ${sharedPalette.grey200.main}`
);
const OFFSET: RegExp = /:focus-visible\s*\{[^}]*outline-offset:\s*2px/;
const HOVER_FILL: string = sharedPalette.containedButtonHover.main;
const CONTAINED_FILL: RegExp = new RegExp(
  `MuiButton-contained:focus-visible\\s*\\{[^}]*background-color:\\s*${HOVER_FILL}`
);

function buttonCss(name: string): string {
  return emotionCssFor(screen.getByRole('button', { name }));
}

describe('UiButton focusOutline', () => {
  it('paints the CRM focus ring and holds the hover fill on a contained button', () => {
    render(
      <UiButton variant="contained" focusOutline>
        Save
      </UiButton>
    );

    const css: string = buttonCss('Save');
    expect(css).toMatch(RING);
    expect(css).toMatch(OFFSET);
    expect(css).toMatch(CONTAINED_FILL);
  });

  it('rings an outlined button too', () => {
    render(
      <UiButton variant="outlined" focusOutline>
        Cancel
      </UiButton>
    );

    expect(buttonCss('Cancel')).toMatch(RING);
  });

  it('adds no focus outline by default', () => {
    render(<UiButton variant="contained">Save</UiButton>);

    const css: string = buttonCss('Save');
    expect(css).not.toMatch(RING);
    expect(css).not.toMatch(CONTAINED_FILL);
  });

  it('adds no focus outline when focusOutline is false', () => {
    render(
      <UiButton variant="contained" focusOutline={false}>
        Save
      </UiButton>
    );

    expect(buttonCss('Save')).not.toMatch(RING);
  });

  it('keeps focusOutline off the rendered element', () => {
    render(
      <UiButton variant="contained" focusOutline>
        Save
      </UiButton>
    );

    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('focusoutline');
  });
});
