import { render, screen } from '@testing-library/react';
import React from 'react';

import { FieldLabel } from '../../src/components/field-controls';

// FieldLabel is the external `<label>` Figma places above every field. Two visual
// state flags ride on it and both are normalised with `=== true`, so an omitted
// (undefined) prop has to render the plain resting label:
//   - `required` makes MUI append its asterisk run after the label text;
//   - `error` puts the label in MUI's error state, which repaints its ink.
// Each flag is asserted on BOTH sides against the rendered DOM.

const LABEL_TEXT: string = 'Work email';
const FIELD_ID: string = 'work-email';
// MUI writes the asterisk as a thin space plus `*`; jest-dom collapses whitespace
// before matching, so an anchored regex pins the label's whole visible text.
const PLAIN_LABEL: RegExp = /^Work email$/;
const REQUIRED_LABEL: RegExp = /^Work email \*$/;

// `getByText` matches an element against its own text nodes only, so the bare
// label text still resolves the `<label>` itself once MUI appends the asterisk
// span beside it.
function labelElement(): HTMLElement {
  return screen.getByText(LABEL_TEXT);
}

function renderLabel(props: { required?: boolean; error?: boolean } = {}): void {
  render(
    <React.Fragment>
      <FieldLabel htmlFor={FIELD_ID} required={props.required} error={props.error}>
        {LABEL_TEXT}
      </FieldLabel>
      <input id={FIELD_ID} />
    </React.Fragment>
  );
}

describe('FieldLabel', () => {
  it('names the control it points at', () => {
    renderLabel();

    expect(screen.getByLabelText(LABEL_TEXT)).toHaveAttribute('id', FIELD_ID);
    expect(labelElement()).toHaveAttribute('for', FIELD_ID);
  });

  describe('required flag', () => {
    it('appends the asterisk run when required is true', () => {
      renderLabel({ required: true });

      const asterisk: HTMLElement = screen.getByText('*');
      expect(asterisk).toHaveClass('MuiFormLabel-asterisk');
      expect(labelElement()).toContainElement(asterisk);
      expect(labelElement()).toHaveTextContent(REQUIRED_LABEL);
    });

    it('renders no asterisk when required is omitted', () => {
      renderLabel();

      expect(screen.queryByText('*')).not.toBeInTheDocument();
      expect(labelElement()).toHaveTextContent(PLAIN_LABEL);
    });

    it('renders no asterisk when required is explicitly false', () => {
      renderLabel({ required: false });

      expect(screen.queryByText('*')).not.toBeInTheDocument();
      expect(labelElement()).toHaveTextContent(PLAIN_LABEL);
    });
  });

  describe('error flag', () => {
    it('puts the label in the error state when error is true', () => {
      renderLabel({ error: true });

      expect(labelElement()).toHaveClass('Mui-error');
    });

    it('leaves the label in the resting state when error is omitted', () => {
      renderLabel();

      expect(labelElement()).not.toHaveClass('Mui-error');
    });

    it('leaves the label in the resting state when error is explicitly false', () => {
      renderLabel({ error: false });

      expect(labelElement()).not.toHaveClass('Mui-error');
    });
  });
});
