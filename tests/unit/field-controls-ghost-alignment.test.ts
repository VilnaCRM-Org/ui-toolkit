import { renderHook } from '@testing-library/react';

import {
  alignGhostOverlay,
  useGhostAlignment,
} from '../../src/components/field-controls/ghost-overlay';

describe('alignGhostOverlay', () => {
  it('does nothing when the overlay is not in the DOM', () => {
    const overlay: HTMLDivElement = document.createElement('div');
    alignGhostOverlay(overlay);
    expect(overlay).toHaveStyle({ left: '' });
  });

  it('does nothing when the wrapper has no input', () => {
    const wrapper: HTMLDivElement = document.createElement('div');
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    alignGhostOverlay(overlay);
    expect(overlay).toHaveStyle({ left: '' });
  });

  it('pins the overlay to the input box when one is present', () => {
    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(document.createElement('input'));
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    alignGhostOverlay(overlay);
    // jsdom has no layout, so every rect is 0 — but the offsets are now written.
    expect(overlay).toHaveStyle({ left: '0px' });
    expect(overlay).toHaveStyle({ top: '0px' });
    expect(overlay).toHaveStyle({ height: '0px' });
    document.body.removeChild(wrapper);
  });
});

describe('useGhostAlignment', () => {
  it('is a no-op when the ref holds no element', () => {
    const ref: React.RefObject<HTMLElement | null> = { current: null };
    expect(() => renderHook(() => useGhostAlignment(ref, 'ost'))).not.toThrow();
  });
});
