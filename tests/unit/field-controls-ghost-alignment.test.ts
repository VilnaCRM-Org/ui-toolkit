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
    const input: HTMLInputElement = document.createElement('input');
    // Pin the input padding to 0 so the assertion is independent of jsdom's UA
    // default input padding (the padding-fold is exercised by the next test).
    input.style.paddingLeft = '0px';
    wrapper.appendChild(input);
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

  it("folds the input's left padding into the overlay offset", () => {
    // The multi-select pads its input left (chips vs text need different insets), so
    // the completion mirror must start at the text, not the input's border box.
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    input.style.paddingLeft = '17px';
    wrapper.appendChild(input);
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    alignGhostOverlay(overlay);
    // jsdom rects are all 0, so the written left offset is purely the folded padding.
    expect(overlay).toHaveStyle({ left: '17px' });
    document.body.removeChild(wrapper);
  });

  it("copies the input's computed font onto the overlay so the ghost matches the field", () => {
    // Each field sets a different value type (search Inter 14, select Golos Text 15,
    // multi-select Inter 16); the overlay mirrors the input's font so the completion
    // never reads at the wrong size/family or sits vertically offset from the value.
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    input.style.fontFamily = 'Golos Text';
    input.style.fontSize = '15px';
    input.style.fontWeight = '500';
    wrapper.appendChild(input);
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    alignGhostOverlay(overlay);
    expect(overlay).toHaveStyle({
      fontFamily: 'Golos Text',
      fontSize: '15px',
      fontWeight: '500',
    });
    document.body.removeChild(wrapper);
  });
});

describe('useGhostAlignment', () => {
  it('is a no-op when the ref holds no element', () => {
    const ref: React.RefObject<HTMLElement | null> = { current: null };
    expect(() => renderHook(() => useGhostAlignment(ref, 'ost'))).not.toThrow();
  });
});
