import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import UiCheckbox from '../../src/components/ui-checkbox';
import { checkIconBackgroundImage } from '../../src/components/ui-checkbox/check-icon';
import styles from '../../src/components/ui-checkbox/styles';
import { colorTokens } from '../../src/utils/palette-tokens';

import { emotionCssFor } from './utils/emotion-css';

const LABEL: string = 'Remember me';
const DATA_URI_PREFIX: string = 'data:image/svg+xml,';
const QUOTED_URL: RegExp = /^url\("([^"\\\n]*)"\)$/;
const FOCUS_SELECTOR: string = '&:focus-within .ui-checkbox-box';
const POINTER_FOCUS_SELECTOR: string = '&:focus-within:not(:has(:focus-visible)) .ui-checkbox-box';
const CHECKED_SELECTOR: string = '& .ui-checkbox-box.ui-checkbox-box--checked';

type StyleRecord = Record<string, unknown>;

function quotedPayload(value: string): string {
  const payload: string | undefined = QUOTED_URL.exec(value)?.[1];
  expect(payload).toBeDefined();
  return payload ?? '';
}

function decodedIcon(): string {
  const payload: string = quotedPayload(checkIconBackgroundImage);
  return decodeURIComponent(payload.slice(DATA_URI_PREFIX.length));
}

function compactCss(css: string): string {
  return css.replace(/\s+/g, '');
}

function checkboxRoot(): HTMLElement {
  return screen.getByRole('checkbox', { name: LABEL }).parentElement as HTMLElement;
}

type RenderState = { checked?: boolean; disabled?: boolean };

function renderCheckbox({ checked, disabled }: RenderState = {}): void {
  render(<UiCheckbox label={LABEL} onChange={jest.fn()} checked={checked} disabled={disabled} />);
}

describe('UiCheckbox checked tick background', () => {
  it('is a double-quoted url() so the declaration survives CSS parsing', () => {
    expect(checkIconBackgroundImage).toMatch(QUOTED_URL);
    expect(checkIconBackgroundImage).not.toMatch(/^url\(data:/);
  });

  it('percent-encodes every character that would end or corrupt the url token', () => {
    const payload: string = quotedPayload(checkIconBackgroundImage);

    expect(payload.startsWith(DATA_URI_PREFIX)).toBe(true);
    expect(payload).not.toMatch(/%(?![0-9A-F]{2})/);
    expect(payload).not.toMatch(/[\s"<>#]/);
  });

  it('decodes to the Figma check icon 7:90', () => {
    const icon: string = decodedIcon();

    expect(icon).toContain("xmlns='http://www.w3.org/2000/svg'");
    expect(icon).toContain("width='16' height='16' viewBox='0 0 16 16'");
    expect(icon).toContain("d='M13.3333 4L6 11.3333L2.66667 8'");
    expect(icon).toContain("stroke='white' stroke-width='2'");
    expect(icon).toContain("stroke-linecap='round' stroke-linejoin='round'");
  });

  it('centres the tick without tiling it on the primary fill', () => {
    const checked: StyleRecord = (styles.checkbox as StyleRecord)[CHECKED_SELECTOR] as StyleRecord;

    expect(checked).toMatchObject({
      border: 'none',
      backgroundColor: colorTokens.palette.primary.main,
      backgroundImage: checkIconBackgroundImage,
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
    });
  });

  it('opts the checked box out of forced colours so the tick stays visible', () => {
    const checked: StyleRecord = (styles.checkbox as StyleRecord)[CHECKED_SELECTOR] as StyleRecord;

    expect(checked['@media (forced-colors: active)']).toEqual({ forcedColorAdjust: 'none' });
  });

  it('emits the quoted tick into the rendered checked box rule', () => {
    renderCheckbox({ checked: true });

    expect(screen.getByRole('checkbox', { name: LABEL })).toBeChecked();
    expect(compactCss(emotionCssFor(checkboxRoot()))).toContain(
      `.ui-checkbox-box.ui-checkbox-box--checked{border:none;background-color:#1EAEFF;` +
        `background-image:${checkIconBackgroundImage};`
    );
  });
});

describe('UiCheckbox keyboard focus ring', () => {
  it.each([
    ['default', styles.checkbox],
    ['error', styles.checkboxError],
  ])('outlines the %s box 2px in the text-primary token, offset 2px', (_state, variant) => {
    expect((variant as StyleRecord)[FOCUS_SELECTOR]).toEqual({
      outline: `2px solid ${colorTokens.palette.grey200.main}`,
      outlineOffset: '2px',
      '@media (forced-colors: active)': { outlineColor: 'CanvasText' },
    });
    expect((variant as StyleRecord)[POINTER_FOCUS_SELECTOR]).toEqual({ outline: 'none' });
  });

  it('emits the focus ring, its forced-colours ink and the pointer-focus reset', () => {
    renderCheckbox();

    const css: string = compactCss(emotionCssFor(checkboxRoot()));
    expect(css).toContain(
      ':focus-within.ui-checkbox-box{outline:2pxsolid#404142;outline-offset:2px;}'
    );
    expect(css).toContain('@media(forced-colors:active){');
    expect(css).toContain(':focus-within.ui-checkbox-box{outline-color:CanvasText;}');
    expect(css).toContain(':focus-within:not(:has(:focus-visible)).ui-checkbox-box{outline:none;}');
  });

  it('keeps a disabled checkbox out of the tab order so no ring can appear', async () => {
    renderCheckbox({ disabled: true });

    await userEvent.tab();

    expect(screen.getByRole('checkbox', { name: LABEL })).not.toHaveFocus();
  });

  it('moves keyboard focus onto an enabled checkbox', async () => {
    renderCheckbox();

    await userEvent.tab();

    expect(screen.getByRole('checkbox', { name: LABEL })).toHaveFocus();
  });
});
