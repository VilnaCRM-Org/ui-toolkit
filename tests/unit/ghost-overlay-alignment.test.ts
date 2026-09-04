import { renderHook } from '@testing-library/react';

import { alignGhostOverlay, useGhostAlignment } from '../../src/components/ghost-overlay';

// jsdom performs no layout, so every real rect is a 0x0 box at the origin — and on
// zeros a subtraction and an addition agree. These stubs put the wrapper and the
// input at different, non-zero viewport positions so the two disagree.
function rectAt(left: number, top: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right: left,
    bottom: top + height,
    width: 0,
    height,
    toJSON: (): Record<string, number> => ({ left, top, height }),
  };
}

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

  it('measures the input box RELATIVE to the wrapper, not away from it', () => {
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    // Padding pinned to 0 so the offsets below are purely the two rects.
    input.style.paddingLeft = '0px';
    wrapper.appendChild(input);
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    // The wrapper sits at (30, 20) in viewport space and the input at (100, 50),
    // so the wrapper-relative offsets are 70/30. Adding the wrapper origin instead
    // would give 130/70 and throw the completion clear of the field.
    jest.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(rectAt(30, 20, 0));
    jest.spyOn(input, 'getBoundingClientRect').mockReturnValue(rectAt(100, 50, 41));

    alignGhostOverlay(overlay);

    expect(overlay).toHaveStyle({ left: '70px' });
    expect(overlay).toHaveStyle({ top: '30px' });
    // The overlay is exactly as tall as the input, so centring the runs inside it
    // centres them on the value rather than on the taller wrapper.
    expect(overlay).toHaveStyle({ height: '41px' });
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

  it('re-pins the overlay when the completion changes', () => {
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    input.style.paddingLeft = '17px';
    wrapper.appendChild(input);
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    const ref: React.RefObject<HTMLElement | null> = { current: overlay };

    const { rerender } = renderHook(
      ({ completion }: { completion: string }): void => useGhostAlignment(ref, completion),
      { initialProps: { completion: 'ost' } }
    );
    expect(overlay).toHaveStyle({ left: '17px' });

    // A chip landing in the multi-select widens the input's leading inset at the
    // same moment the completion changes. The completion is what the effect
    // watches, so only re-running on it picks the new inset up; a frozen
    // dependency list would leave the ghost at the stale 17px, overlapping the
    // typed text.
    input.style.paddingLeft = '41px';
    rerender({ completion: 'oster' });

    expect(overlay).toHaveStyle({ left: '41px' });
    document.body.removeChild(wrapper);
  });

  it('pins the overlay and registers a resize listener it tears down on unmount', () => {
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    input.style.paddingLeft = '17px';
    wrapper.appendChild(input);
    const overlay: HTMLDivElement = document.createElement('div');
    wrapper.appendChild(overlay);
    document.body.appendChild(wrapper);
    const ref: React.RefObject<HTMLElement | null> = { current: overlay };
    const addSpy: jest.SpyInstance = jest.spyOn(window, 'addEventListener');
    const removeSpy: jest.SpyInstance = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useGhostAlignment(ref, 'ost'));

    // alignGhostOverlay ran against the element, folding the input's 17px left padding in.
    expect(overlay).toHaveStyle({ left: '17px' });
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();
    // The resize listener is removed on unmount, so the field leaks nothing.
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
    document.body.removeChild(wrapper);
  });
});
