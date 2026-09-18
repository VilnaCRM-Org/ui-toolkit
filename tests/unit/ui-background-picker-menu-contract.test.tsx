import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiBackgroundPicker from '@/components/ui-background-picker';
import type { BackgroundOptionGroup } from '@/components/ui-background-picker/types';

import { nodesMatching } from './utils/dom-queries';
import firstOf from './utils/first-of';
import mockConsoleError from './utils/mock-console-error';
import mockConsoleWarn from './utils/mock-console-warn';

mockConsoleWarn();
const error: { readonly spy: jest.SpyInstance } = mockConsoleError();

const noop: () => void = () => undefined;

const IMG_SRC: string = 'data:image/png;base64,AAA=';
const CHEVRON_D: string = 'M6 9L12 15L18 9';

const GROUPS: BackgroundOptionGroup[] = [
  {
    options: [
      { id: 'name-1', label: 'Назва 1', kind: 'image', src: IMG_SRC },
      { id: 'name-2', label: 'Назва 2', kind: 'image', src: IMG_SRC },
    ],
  },
  {
    heading: 'Колір',
    options: [
      { id: 'grey', label: 'Сірий', kind: 'color', color: '#E1E7EA' },
      { id: 'blue', label: 'Синій', kind: 'color', color: '#1EAEFF' },
    ],
  },
];

function openPicker(onChange?: (id: string) => void): React.ReactElement {
  return (
    <UiBackgroundPicker groups={GROUPS} value="grey" open onOpenChange={noop} onChange={onChange} />
  );
}

function row(name: string): HTMLElement {
  return screen.getByRole('menuitemradio', { name });
}

describe('UiBackgroundPicker menu rows', () => {
  it('paints an image row with the option image and a colour row with a swatch only', () => {
    render(openPicker());
    const images: Element[] = nodesMatching('[role="menuitemradio"] > img');
    const swatches: Element[] = nodesMatching('[role="menuitemradio"] > span[aria-hidden="true"]');
    expect(images).toHaveLength(2);
    expect(swatches).toHaveLength(2);
    expect(firstOf(images)).toHaveAttribute('src', IMG_SRC);
    expect(row('Назва 1')).toContainElement(firstOf(images) as HTMLElement);
    expect(row('Сірий')).toContainElement(firstOf(swatches) as HTMLElement);
  });

  it('keeps every row out of the tab order', () => {
    render(openPicker());
    for (const item of screen.getAllByRole('menuitemradio')) {
      expect(item).toHaveAttribute('tabindex', '-1');
    }
  });

  it('activates a row through the latest onChange after the handler is swapped', async () => {
    const user: UserEvent = userEvent.setup();
    const first: jest.Mock = jest.fn();
    const second: jest.Mock = jest.fn();
    const { rerender } = render(openPicker(first));
    rerender(openPicker(second));
    await user.click(row('Синій'));
    expect(second).toHaveBeenCalledWith('blue');
    expect(first).not.toHaveBeenCalled();
  });
});

describe('UiBackgroundPicker menu groups', () => {
  it('gives only the headed group a role and a visible heading', () => {
    render(openPicker());
    const groups: HTMLElement[] = screen.getAllByRole('group');
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAccessibleName('Колір');
    expect(within(firstOf(groups)).getByText('Колір')).toBeInTheDocument();
    const headless: Element[] = nodesMatching('[role="menu"] > div:not([role])');
    expect(headless).toHaveLength(1);
    expect(firstOf(headless)).not.toHaveAttribute('aria-labelledby');
    expect(firstOf(headless)).toContainElement(row('Назва 1'));
    expect(nodesMatching('[role="menu"] > div[aria-labelledby]')).toHaveLength(1);
  });

  it('keys each group uniquely so React never reports colliding children', () => {
    render(openPicker());
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(4);
    expect(error.spy).not.toHaveBeenCalled();
  });
});

describe('UiBackgroundPicker identity and chevron', () => {
  it('carries its display name for devtools and error boundaries', () => {
    expect(UiBackgroundPicker.displayName).toBe('UiBackgroundPicker');
  });

  it('draws the Figma chevron path inside the trigger', () => {
    render(<UiBackgroundPicker groups={GROUPS} onOpenChange={noop} />);
    const paths: Element[] = nodesMatching('button svg path');
    expect(paths).toHaveLength(1);
    expect(firstOf(paths)).toHaveAttribute('d', CHEVRON_D);
  });
});
