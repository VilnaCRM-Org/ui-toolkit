import { render, screen } from '@testing-library/react';
import React from 'react';

import { composeEndAdornment } from '../../src/components/field-controls/compose-end-adornment';
import { FieldSpinner } from '../../src/components/field-controls/field-spinner';
import {
  FIELD_SPINNER_MD,
  FIELD_SPINNER_RING,
  FIELD_SPINNER_THICKNESS,
  fieldSpinnerSx,
} from '../../src/components/field-controls/field-spinner-styles';
import {
  DEFAULT_LOADING_TEXT,
  LOADING_ANNOUNCE_DELAY_MS,
  useLoadingAnnouncement,
} from '../../src/components/field-controls/use-loading-announcement';

describe('FieldSpinner', () => {
  it('stays out of the accessibility tree', () => {
    render(<FieldSpinner />);
    // CircularProgress emits role="progressbar" unconditionally but carries no
    // value while indeterminate, so exposing it would publish a nameless,
    // valueless progressbar. aria-hidden is what keeps it decorative.
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    // `hidden: true` reaches into the hidden subtree, which is the only way to
    // see the element at all — precisely the point of the assertion above.
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('defaults to the shared 20px glyph box and honours an explicit size', () => {
    const { rerender } = render(<FieldSpinner />);
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveStyle({
      width: FIELD_SPINNER_MD,
    });
    rerender(<FieldSpinner size={FIELD_SPINNER_RING} />);
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveStyle({
      width: FIELD_SPINNER_RING,
    });
  });

  it('pins the dash so a frozen spinner is still a legible arc', () => {
    render(<FieldSpinner />);
    // Without disableShrink the shrink keyframe starts at `1px, 200px` — under
    // prefers-reduced-motion, or the visual harness's blanket `animation: none`,
    // the arc would freeze as an invisible dot.
    expect(screen.getByRole('progressbar', { hidden: true }).innerHTML).toContain(
      'circleDisableShrink'
    );
  });

  it('cannot swallow clicks on the control it rings, and freezes under reduced motion', () => {
    const sx: Record<string, unknown> = fieldSpinnerSx as Record<string, unknown>;
    expect(sx.pointerEvents).toBe('none');
    expect(sx.cursor).toBe('default');
    const reduced: Record<string, unknown> = sx[
      '@media (prefers-reduced-motion: reduce)'
    ] as Record<string, unknown>;
    expect(reduced.animation).toBe('none');
    expect(FIELD_SPINNER_THICKNESS).toBe(4.5);
  });
});

describe('composeEndAdornment', () => {
  const own: React.ReactElement = <span data-slot="mui" />;
  const loading: React.ReactElement = <span data-slot="loading" />;

  it('returns MUI-s own adornment untouched when there is no loading slot', () => {
    expect(composeEndAdornment(null, own)).toBe(own);
  });

  it('returns the loading slot alone when MUI supplies none', () => {
    expect(composeEndAdornment(loading, null)).toBe(loading);
  });

  it('keeps both, loading slot first, when MUI supplies indicators', () => {
    const composed: React.ReactNode = composeEndAdornment(loading, own);
    render(<div role="group">{composed}</div>);
    expect(screen.getByRole('group').innerHTML).toContain('data-slot="loading"');
    expect(screen.getByRole('group').innerHTML).toContain('data-slot="mui"');
  });
});

function Probe({ loading, text }: { loading?: boolean; text?: string }): React.ReactElement {
  const announced: string = useLoadingAnnouncement(loading, text ?? DEFAULT_LOADING_TEXT);
  return <div role="status">{announced}</div>;
}

describe('useLoadingAnnouncement', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('says nothing while idle', () => {
    render(<Probe />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('stays silent under the announce delay and speaks once past it', () => {
    render(<Probe loading />);
    React.act(() => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS - 1);
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    React.act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByRole('status')).toHaveTextContent(DEFAULT_LOADING_TEXT);
  });

  it('never lets a fetch that settles early announce late', () => {
    const { rerender } = render(<Probe loading />);
    React.act(() => {
      jest.advanceTimersByTime(300);
    });
    rerender(<Probe loading={false} />);
    React.act(() => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('clears when a fetch settles after it was announced', () => {
    const { rerender } = render(<Probe loading />);
    React.act(() => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getByRole('status')).toHaveTextContent(DEFAULT_LOADING_TEXT);
    rerender(<Probe loading={false} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('speaks caller-supplied copy', () => {
    render(<Probe loading text="Шукаємо" />);
    React.act(() => {
      jest.advanceTimersByTime(LOADING_ANNOUNCE_DELAY_MS);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Шукаємо');
  });
});
