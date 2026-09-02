import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiBackgroundPicker from '@/components/ui-background-picker';
import backgroundPickerWarning from '@/components/ui-background-picker/background-picker-warnings';
import {
  handleOutsidePointerDown,
  handleRowActivate,
  handleTriggerClick,
} from '@/components/ui-background-picker/picker-actions';
import { focusMenuEdge, moveMenuFocus } from '@/components/ui-background-picker/picker-dom';
import {
  handleMenuKeyDown,
  handleTriggerKeyDown,
  openIntentForKey,
} from '@/components/ui-background-picker/picker-keyboard';
import {
  assignTriggerNode,
  usePickerCtx,
  usePickerRefs,
  type PickerCtx,
  type PickerRefs,
} from '@/components/ui-background-picker/picker-refs';
import {
  CARD_SHADOW_TINT,
  cardRootSx,
  chevronWrapSx,
  colorMediaSx,
  dividerSx,
  headingSx,
  imageMediaSx,
  menuSx,
  rowSx,
  sectionSx,
  triggerButtonSx,
  triggerLabelSx,
} from '@/components/ui-background-picker/styles';
import type {
  BackgroundOptionGroup,
  UiBackgroundPickerProps,
} from '@/components/ui-background-picker/types';
import {
  DEFAULT_TRIGGER_LABEL,
  useBackgroundPicker,
  useRequestOpen,
  type BackgroundPickerModel,
} from '@/components/ui-background-picker/use-background-picker';

import mockConsoleWarn from './utils/mock-console-warn';

const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: () => void = () => undefined;

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here.
const WHITE: string = '#FFF';
const BRAND_GRAY: string = '#E1E7EA';
const GREY400: string = '#D0D4D8';
const GREY500: string = '#EAECEE';
const GREY300: string = '#969B9D';
const DARK_SECONDARY: string = '#1B2327';
const DARK_PRIMARY: string = '#1A1C1E';
const PRIMARY: string = '#1EAEFF';

const IMG_SRC: string = 'data:image/png;base64,AAA=';

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
      { id: 'grey', label: 'Сірий', kind: 'color', color: BRAND_GRAY },
      { id: 'blue', label: 'Синій', kind: 'color', color: PRIMARY },
    ],
  },
];

interface PickerOverrides {
  groups?: BackgroundOptionGroup[];
  label?: string;
  value?: string;
  onChange?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  lang?: string;
}

function pickerWith(extra: Readonly<PickerOverrides>): React.ReactElement {
  return (
    <UiBackgroundPicker
      groups={'groups' in extra ? (extra.groups as BackgroundOptionGroup[]) : GROUPS}
      label={extra.label}
      value={extra.value}
      onChange={extra.onChange}
      open={extra.open}
      onOpenChange={extra.onOpenChange}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
    />
  );
}

/**
 * `open` and `value` are always controlled — the component never flips them
 * itself, only requests the next one — so a real interaction test needs a
 * stateful wrapper that feeds the request back, exactly as a consumer would
 * (the story's own `BackgroundPickerStory` shape).
 */
function ControlledPicker(props: Readonly<PickerOverrides>): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(props.open ?? false);
  const [value, setValue] = React.useState<string>(props.value ?? '');
  const handleOpenChange = React.useCallback(
    (next: boolean): void => {
      setOpen(next);
      props.onOpenChange?.(next);
    },
    [props]
  );
  const handleChange = React.useCallback(
    (id: string): void => {
      setValue(id);
      props.onChange?.(id);
    },
    [props]
  );
  return (
    <UiBackgroundPicker
      groups={props.groups ?? GROUPS}
      label={props.label}
      value={value}
      onChange={handleChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={props.disabled}
      id={props.id}
      lang={props.lang}
    />
  );
}

function trigger(): HTMLElement {
  return screen.getByRole('button');
}

function rows(): HTMLElement[] {
  return screen.getAllByRole('menuitemradio');
}

// The board-preview images are decorative (`alt=""`), which maps to the
// presentation role and drops out of the default role query, so they are
// counted directly rather than through a Testing Library query.
function imageCount(): number {
  return document.querySelectorAll('img').length;
}

describe('styles', () => {
  it('resolves rest chrome with the hover rule only while interactive', () => {
    const interactive = cardRootSx({ interactive: true, open: false, disabled: false }, undefined);
    const bare = cardRootSx({ interactive: false, open: false, disabled: false }, undefined);
    expect((interactive as Record<string, unknown>[])[0]).toMatchObject({
      backgroundColor: WHITE,
      borderColor: BRAND_GRAY,
      '&:hover': { borderColor: GREY400 },
    });
    expect((bare as Record<string, unknown>[])[0]).not.toHaveProperty('&:hover');
  });

  it('resolves the open chrome', () => {
    const [base] = cardRootSx({ interactive: true, open: true, disabled: false }, undefined) as [
      Record<string, unknown>,
    ];
    expect(base.borderColor).toBe(BRAND_GRAY);
    expect(base.boxShadow).toBe(`0 8px 27px ${CARD_SHADOW_TINT}`);
  });

  it('resolves the disabled chrome regardless of open/interactive', () => {
    const [base] = cardRootSx({ interactive: true, open: true, disabled: true }, undefined) as [
      Record<string, unknown>,
    ];
    expect(base.backgroundColor).toBe(GREY500);
    expect(base.borderColor).toBe('transparent');
    expect(base.boxShadow).toBe('none');
  });

  it('merges consumer sx as an object and as an array', () => {
    const state = { interactive: false, open: false, disabled: false };
    const withObject = cardRootSx(state, { margin: 1 });
    const withArray = cardRootSx(state, [{ margin: 1 }, { padding: 2 }]);
    expect(withObject).toHaveLength(2);
    expect(withArray).toHaveLength(3);
  });

  it('returns the static trigger layout when not interactive', () => {
    const sx = triggerButtonSx({ interactive: false, open: false, disabled: true });
    expect(sx).not.toHaveProperty('cursor');
  });

  it('sets the trigger cursor from disabled while interactive', () => {
    const enabled = triggerButtonSx({ interactive: true, open: false, disabled: false }) as Record<
      string,
      unknown
    >;
    const disabled = triggerButtonSx({ interactive: true, open: false, disabled: true }) as Record<
      string,
      unknown
    >;
    expect(enabled.cursor).toBe('pointer');
    expect(disabled.cursor).toBe('default');
  });

  it('resolves the trigger label ink from disabled', () => {
    expect((triggerLabelSx(false) as Record<string, unknown>).color).toBe(DARK_SECONDARY);
    expect((triggerLabelSx(true) as Record<string, unknown>).color).toBe(GREY300);
  });

  it('fills the colour swatch with the consumer colour', () => {
    expect((colorMediaSx(PRIMARY) as Record<string, unknown>).backgroundColor).toBe(PRIMARY);
    expect((colorMediaSx(undefined) as Record<string, unknown>).backgroundColor).toBeUndefined();
  });

  it('exposes the constant painted objects', () => {
    expect((chevronWrapSx as Record<string, unknown>).color).toBe(GREY300);
    expect((menuSx as Record<string, unknown>).padding).toBe(0);
    expect((dividerSx as Record<string, unknown>).borderTop).toBe(`2px solid ${BRAND_GRAY}`);
    expect((sectionSx as Record<string, unknown>).gap).toBe('0.875rem');
    expect((headingSx as Record<string, unknown>).padding).toBe('0 19px');
    expect((rowSx as Record<string, unknown>).color).toBe(DARK_SECONDARY);
    expect((imageMediaSx as Record<string, unknown>).borderRadius).toBe('50%');
  });
});

describe('backgroundPickerWarning', () => {
  function props(extra: Readonly<PickerOverrides>): UiBackgroundPickerProps {
    return { groups: GROUPS, ...extra };
  }

  it('is silent for a wired picker with no misconfiguration', () => {
    expect(backgroundPickerWarning(props({ onOpenChange: noop }), 4)).toBeNull();
  });

  it('warns when open/value/onChange are supplied without onOpenChange', () => {
    expect(backgroundPickerWarning(props({ open: true }), 4)).toMatch(/onOpenChange/);
    expect(backgroundPickerWarning(props({ value: 'grey' }), 4)).toMatch(/onOpenChange/);
    expect(backgroundPickerWarning(props({ onChange: noop }), 4)).toMatch(/onOpenChange/);
  });

  it('is silent for a genuinely static picker', () => {
    expect(backgroundPickerWarning(props({}), 4)).toBeNull();
  });

  it('warns when open is combined with disabled', () => {
    const message = backgroundPickerWarning(
      props({ onOpenChange: noop, open: true, disabled: true }),
      4
    );
    expect(message).toMatch(/disabled/);
  });

  it('warns when opened with zero options', () => {
    const message = backgroundPickerWarning(props({ onOpenChange: noop, open: true }), 0);
    expect(message).toMatch(/no options/);
  });
});

describe('picker-dom', () => {
  function menuWith(count: number): HTMLElement {
    const menu = document.createElement('div');
    for (let index = 0; index < count; index += 1) {
      const row = document.createElement('button');
      row.setAttribute('role', 'menuitemradio');
      row.textContent = `row-${index}`;
      menu.appendChild(row);
    }
    document.body.appendChild(menu);
    return menu;
  }

  it('no-ops on a null menu', () => {
    expect(() => focusMenuEdge(null, 'first')).not.toThrow();
    expect(() => moveMenuFocus(null, 1)).not.toThrow();
  });

  it('no-ops on a menu with no rows', () => {
    const menu = menuWith(0);
    expect(() => focusMenuEdge(menu, 'first')).not.toThrow();
    expect(() => moveMenuFocus(menu, 1)).not.toThrow();
    menu.remove();
  });

  it('focuses the first or last row', () => {
    const menu = menuWith(3);
    focusMenuEdge(menu, 'first');
    expect(menu.children[0]).toHaveFocus();
    focusMenuEdge(menu, 'last');
    expect(menu.children[2]).toHaveFocus();
    menu.remove();
  });

  it('moves focus by delta, wrapping at both ends', () => {
    const menu = menuWith(3);
    focusMenuEdge(menu, 'first');
    moveMenuFocus(menu, 1);
    expect(menu.children[1]).toHaveFocus();
    moveMenuFocus(menu, 1);
    expect(menu.children[2]).toHaveFocus();
    moveMenuFocus(menu, 1);
    expect(menu.children[0]).toHaveFocus();
    moveMenuFocus(menu, -1);
    expect(menu.children[2]).toHaveFocus();
    menu.remove();
  });

  it('defaults to row 0 as the start when nothing is focused yet', () => {
    const menu = menuWith(3);
    moveMenuFocus(menu, 1);
    expect(menu.children[1]).toHaveFocus();
    menu.remove();
  });
});

function makeIntentCell(): PickerRefs['intent'] {
  const cell: PickerRefs['intent'] = {
    current: null,
    set: (value): void => {
      cell.current = value;
    },
    clear: (): void => {
      cell.current = null;
    },
  };
  return cell;
}

function bareRefs(): PickerRefs {
  return {
    wrapper: { current: null },
    trigger: { current: null },
    menu: { current: null },
    intent: makeIntentCell(),
  };
}

function bareCtx(overrides: Partial<PickerCtx> = {}): PickerCtx {
  return {
    refs: bareRefs(),
    open: false,
    disabled: false,
    value: '',
    requestOpen: jest.fn(),
    onSelect: undefined,
    ...overrides,
  };
}

function keyEvent(key: string): React.KeyboardEvent<HTMLElement> {
  return { key, preventDefault: jest.fn() } as unknown as React.KeyboardEvent<HTMLElement>;
}

describe('picker-keyboard', () => {
  it('maps only ArrowDown/ArrowUp to an open intent', () => {
    expect(openIntentForKey('ArrowDown')).toBe('first');
    expect(openIntentForKey('ArrowUp')).toBe('last');
    expect(openIntentForKey('Tab')).toBeNull();
  });

  it('records an open intent and requests open from a closed trigger', () => {
    const ctx = bareCtx({ open: false });
    const event = keyEvent('ArrowDown');
    handleTriggerKeyDown(ctx, event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(ctx.refs.intent.current).toBe('first');
    expect(ctx.requestOpen).toHaveBeenCalledWith(true);
  });

  it('ignores an unrelated key on a closed trigger', () => {
    const ctx = bareCtx({ open: false });
    handleTriggerKeyDown(ctx, keyEvent('a'));
    expect(ctx.requestOpen).not.toHaveBeenCalled();
  });

  it('closes on Escape from an open trigger and ignores other keys', () => {
    const ctx = bareCtx({ open: true });
    handleTriggerKeyDown(ctx, keyEvent('Escape'));
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
    const ctx2 = bareCtx({ open: true });
    handleTriggerKeyDown(ctx2, keyEvent('a'));
    expect(ctx2.requestOpen).not.toHaveBeenCalled();
  });

  it('closes to the trigger on Escape inside the menu', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const ctx = bareCtx({ open: true });
    ctx.refs.trigger.current = button as unknown as HTMLButtonElement;
    handleMenuKeyDown(ctx, keyEvent('Escape'));
    expect(button).toHaveFocus();
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
    button.remove();
  });

  it('closes on Escape without throwing when the trigger node is gone', () => {
    const ctx = bareCtx({ open: true });
    expect(() => handleMenuKeyDown(ctx, keyEvent('Escape'))).not.toThrow();
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('moves and jumps focus inside the menu, and ignores unrelated keys', () => {
    const menu = document.createElement('div');
    document.body.appendChild(menu);
    for (let index = 0; index < 2; index += 1) {
      const row = document.createElement('button');
      row.setAttribute('role', 'menuitemradio');
      menu.appendChild(row);
    }
    const ctx = bareCtx({ open: true });
    ctx.refs.menu.current = menu as unknown as HTMLDivElement;
    (menu.children[0] as HTMLElement).focus();

    handleMenuKeyDown(ctx, keyEvent('ArrowDown'));
    expect(menu.children[1]).toHaveFocus();
    handleMenuKeyDown(ctx, keyEvent('End'));
    expect(menu.children[1]).toHaveFocus();
    handleMenuKeyDown(ctx, keyEvent('Home'));
    expect(menu.children[0]).toHaveFocus();

    const unrelated = keyEvent('a');
    handleMenuKeyDown(ctx, unrelated);
    expect(unrelated.preventDefault).not.toHaveBeenCalled();
    menu.remove();
  });
});

describe('picker-actions', () => {
  it('opens a closed trigger onto the first row', () => {
    const ctx = bareCtx({ open: false });
    handleTriggerClick(ctx);
    expect(ctx.refs.intent.current).toBe('first');
    expect(ctx.requestOpen).toHaveBeenCalledWith(true);
  });

  it('closes an open trigger', () => {
    const ctx = bareCtx({ open: true });
    handleTriggerClick(ctx);
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('treats a pointerdown as outside when there is no wrapper node yet', () => {
    const ctx = bareCtx({ open: true });
    const event = { target: document.body } as unknown as PointerEvent;
    handleOutsidePointerDown(ctx, event);
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('treats a pointerdown as outside when its target is not a Node', () => {
    const ctx = bareCtx({ open: true });
    ctx.refs.wrapper.current = document.createElement('div');
    const event = { target: null } as unknown as PointerEvent;
    handleOutsidePointerDown(ctx, event);
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('ignores a pointerdown inside the wrapper', () => {
    const ctx = bareCtx({ open: true });
    const wrapper = document.createElement('div');
    const inner = document.createElement('span');
    wrapper.appendChild(inner);
    ctx.refs.wrapper.current = wrapper;
    handleOutsidePointerDown(ctx, { target: inner } as unknown as PointerEvent);
    expect(ctx.requestOpen).not.toHaveBeenCalled();
  });

  it('closes on a pointerdown outside the wrapper', () => {
    const ctx = bareCtx({ open: true });
    ctx.refs.wrapper.current = document.createElement('div');
    handleOutsidePointerDown(ctx, { target: document.body } as unknown as PointerEvent);
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('reports a genuine value change, closing and refocusing the trigger', () => {
    const onSelect = jest.fn();
    const button = document.createElement('button');
    document.body.appendChild(button);
    const ctx = bareCtx({ open: true, value: 'grey', onSelect });
    ctx.refs.trigger.current = button as unknown as HTMLButtonElement;
    handleRowActivate(ctx, 'blue');
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
    expect(button).toHaveFocus();
    expect(onSelect).toHaveBeenCalledWith('blue');
    button.remove();
  });

  it('tolerates a genuine value change with no onSelect wired', () => {
    const ctx = bareCtx({ open: true, value: 'grey', onSelect: undefined });
    expect(() => handleRowActivate(ctx, 'blue')).not.toThrow();
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
  });

  it('re-picking the checked row closes silently', () => {
    const onSelect = jest.fn();
    const ctx = bareCtx({ open: true, value: 'grey', onSelect });
    handleRowActivate(ctx, 'grey');
    expect(ctx.requestOpen).toHaveBeenCalledWith(false);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('picker-refs', () => {
  it('threads the trigger node into a callback ref and an object ref', () => {
    const node = document.createElement('button');
    const own: PickerRefs['trigger'] = { current: null };
    const callback = jest.fn();
    assignTriggerNode({ forwarded: callback, own, node });
    expect(own.current).toBe(node);
    expect(callback).toHaveBeenCalledWith(node);

    const objectRef: React.RefObject<HTMLButtonElement | null> = { current: null };
    assignTriggerNode({ forwarded: objectRef, own, node });
    expect(objectRef.current).toBe(node);
  });

  it('is a no-op on a null forwarded ref', () => {
    const own: PickerRefs['trigger'] = { current: null };
    const node = document.createElement('button');
    expect(() => assignTriggerNode({ forwarded: null, own, node })).not.toThrow();
    expect(own.current).toBe(node);
  });

  it('creates a stable ref bundle across re-renders', () => {
    const { result, rerender } = renderHook(() => usePickerRefs());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('memoises the context over its inputs', () => {
    const refs = bareRefs();
    const requestOpen = jest.fn();
    const { result, rerender } = renderHook(
      (props: { open: boolean }) =>
        usePickerCtx({
          refs,
          open: props.open,
          disabled: false,
          value: '',
          requestOpen,
          onSelect: undefined,
        }),
      { initialProps: { open: false } }
    );
    const first = result.current;
    rerender({ open: false });
    expect(result.current).toBe(first);
    rerender({ open: true });
    expect(result.current).not.toBe(first);
  });
});

describe('useRequestOpen', () => {
  it('forwards the request only while not disabled', () => {
    const handler = jest.fn();
    const { result, rerender } = renderHook(
      (props: { disabled: boolean }) => useRequestOpen(handler, props.disabled),
      { initialProps: { disabled: true } }
    );
    act(() => result.current(true));
    expect(handler).not.toHaveBeenCalled();
    rerender({ disabled: false });
    act(() => result.current(true));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('is a no-op with no handler at all', () => {
    const { result } = renderHook(() => useRequestOpen(undefined, false));
    expect(() => act(() => result.current(true))).not.toThrow();
  });
});

describe('useBackgroundPicker', () => {
  it('builds a static model with no ARIA plumbing', () => {
    const props: UiBackgroundPickerProps = { groups: GROUPS };
    const { result } = renderHook(() => useBackgroundPicker(props, null));
    const model: BackgroundPickerModel = result.current;
    expect(model.interactive).toBe(false);
    expect(model.menuOpen).toBe(false);
    expect(model.ariaExpanded).toBeUndefined();
    expect(model.ariaControls).toBeUndefined();
    expect(model.ariaDisabled).toBeUndefined();
  });
});

describe('BackgroundPickerTrigger and BackgroundPickerMenu (via the full component)', () => {
  it('mounts the wired trigger with the APG menu-button wiring', () => {
    render(pickerWith({ onOpenChange: noop }));
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('mounts no button at all in the static branch', () => {
    render(pickerWith({}));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a headless and a headed group with image and colour media', () => {
    render(pickerWith({ onOpenChange: noop, open: true, value: 'grey' }));
    expect(screen.getByRole('group', { name: 'Колір' })).toBeInTheDocument();
    expect(imageCount()).toBe(2);
    expect(screen.getByRole('menuitemradio', { name: 'Сірий' })).toBeChecked();
    expect(screen.getByRole('menuitemradio', { name: 'Синій' })).not.toBeChecked();
  });
});

describe('UiBackgroundPicker', () => {
  it('renders the wired closed trigger with the default label', () => {
    render(pickerWith({ onOpenChange: noop }));
    expect(trigger()).toHaveAccessibleName(DEFAULT_TRIGGER_LABEL);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('accepts a custom label on the wired trigger', () => {
    render(pickerWith({ onOpenChange: noop, label: 'Фон дошки' }));
    expect(trigger()).toHaveAccessibleName('Фон дошки');
  });

  it('accepts a custom label on the static trigger', () => {
    render(pickerWith({ label: 'Фон дошки' }));
    expect(screen.getByText('Фон дошки')).toBeInTheDocument();
  });

  it('tolerates a runtime-nullish groups array', () => {
    render(pickerWith({ onOpenChange: noop, groups: undefined }));
    expect(trigger()).toHaveAccessibleName(DEFAULT_TRIGGER_LABEL);
    expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument();
  });

  it('opens on click, focusing the first row, and closes on a second click', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledPicker />);
    await user.click(trigger());
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(rows()[0]).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-controls', screen.getByRole('menu').id);

    await user.click(trigger());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens onto the last row with ArrowUp on the closed trigger', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledPicker />);
    trigger().focus();
    await user.keyboard('{ArrowUp}');
    expect(rows()[rows().length - 1]).toHaveFocus();
  });

  it('navigates rows with the arrow keys, wrapping, and Home/End', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledPicker />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    expect(rows()[1]).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(rows()[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(rows()[rows().length - 1]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(rows()[0]).toHaveFocus();
  });

  it('returns focus to the trigger and closes on Escape', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledPicker />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes on an outside pointerdown', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledPicker />);
    await user.click(trigger());
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('reports the picked id, closes, and refocuses the trigger', async () => {
    const user: UserEvent = userEvent.setup();
    const handleChange: jest.Mock = jest.fn();
    render(<ControlledPicker value="grey" onChange={handleChange} />);
    await user.click(trigger());
    await user.click(screen.getByRole('menuitemradio', { name: 'Синій' }));
    expect(handleChange).toHaveBeenCalledWith('blue');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    await user.click(trigger());
    expect(screen.getByRole('menuitemradio', { name: 'Синій' })).toBeChecked();
  });

  it('re-picking the checked row closes without firing onChange', async () => {
    const user: UserEvent = userEvent.setup();
    const handleChange: jest.Mock = jest.fn();
    render(<ControlledPicker value="grey" onChange={handleChange} />);
    await user.click(trigger());
    await user.click(screen.getByRole('menuitemradio', { name: 'Сірий' }));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps the disabled trigger closed even when open is requested', () => {
    render(pickerWith({ onOpenChange: noop, open: true, disabled: true }));
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('disabled'));
  });

  it('a disabled trigger click and keydown are no-ops', async () => {
    const user: UserEvent = userEvent.setup();
    const handleOpenChange: jest.Mock = jest.fn();
    render(pickerWith({ onOpenChange: handleOpenChange, disabled: true }));
    await user.click(trigger());
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('warns and renders no menu when opened with no options', () => {
    render(pickerWith({ onOpenChange: noop, open: true, groups: [] }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no options'));
  });

  it('renders a static picker as plain content with no ARIA', () => {
    render(pickerWith({ open: true, value: 'grey' }));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByText(DEFAULT_TRIGGER_LABEL)).toBeInTheDocument();
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('onOpenChange'));
  });

  it('forwards the ref to the trigger button, function and object forms', () => {
    const callback: jest.Mock = jest.fn();
    render(<UiBackgroundPicker groups={GROUPS} onOpenChange={noop} id="picker-1" ref={callback} />);
    expect(callback).toHaveBeenCalledWith(expect.any(HTMLButtonElement));

    const objectRef: React.RefObject<HTMLButtonElement | null> = React.createRef();
    render(
      <UiBackgroundPicker groups={GROUPS} onOpenChange={noop} id="picker-2" ref={objectRef} />
    );
    expect(objectRef.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('is a no-op when no ref is forwarded at all', () => {
    expect(() => render(pickerWith({ onOpenChange: noop, id: 'picker-3' }))).not.toThrow();
  });

  it('unmounts cleanly while open', async () => {
    const user: UserEvent = userEvent.setup();
    const { unmount } = render(<ControlledPicker />);
    await user.click(trigger());
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(() => unmount()).not.toThrow();
  });
});
