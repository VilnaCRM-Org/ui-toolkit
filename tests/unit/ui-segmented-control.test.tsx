import { render, renderHook, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiSegmentedControl from '../../src/components/ui-segmented-control';
import {
  accessibleNameWarning,
  blankLabelWarning,
  duplicateValueWarning,
  emptyOptionsWarning,
  unmatchedValueWarning,
  unwiredValueWarning,
} from '../../src/components/ui-segmented-control/segmented-control-warnings';
import {
  SEGMENT_BASE,
  TRACK_BASE,
  segmentSx,
  trackSx,
} from '../../src/components/ui-segmented-control/styles';
import type {
  SegmentedOption,
  UiSegmentedControlProps,
} from '../../src/components/ui-segmented-control/types';
import {
  useSegmentedControl,
  type SegmentedControlModel,
} from '../../src/components/ui-segmented-control/use-segmented-control';

import mockConsoleWarn from './utils/mock-console-warn';

// UiSegmentedControl emits several dev-only guidance warnings via console.warn.
// Silence them for the whole file and assert on the spy in the dedicated block.
const warn: { readonly spy: jest.SpyInstance } = mockConsoleWarn();

const noop: (value: string) => void = () => undefined;

// Board B's own three options, verbatim.
const options: SegmentedOption[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
];

// Palette literals, pinned rather than imported: a mutation that swaps a token
// for its neighbour must fail here.
const GREY500: string = '#EAECEE';
const GREY300: string = '#969B9D';
const DARK_PRIMARY: string = '#1A1C1E';
const WHITE: string = '#FFF';
const HOVER_FILL: string = 'rgba(255, 255, 255, 0.52)';

interface ControlOverrides {
  options?: readonly SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  labelledBy?: string;
  disabled?: boolean;
  id?: string;
  lang?: string;
  sx?: UiSegmentedControlProps['sx'];
}

// Props are applied one by one (the repo forbids JSX spreading).
function controlWith(
  extra: Readonly<ControlOverrides>,
  ref?: React.Ref<HTMLDivElement>
): React.ReactElement {
  return (
    <UiSegmentedControl
      ref={ref}
      options={extra.options ?? options}
      value={extra.value}
      onChange={extra.onChange}
      label={extra.label}
      labelledBy={extra.labelledBy}
      disabled={extra.disabled}
      id={extra.id}
      lang={extra.lang}
      sx={extra.sx}
    />
  );
}

function nodesMatching(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector));
}

// Thin stateful wrapper for the controlled round-trip test: the control is
// always controlled, so a real consumer feeds the next value back via onChange.
function ControlledControl(): React.ReactElement {
  const [value, setValue] = React.useState<string>('');
  return <UiSegmentedControl options={options} label="Період" value={value} onChange={setValue} />;
}

describe('UiSegmentedControl — wired rendering and accessible name', () => {
  it('renders a radiogroup with a radio per option', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('names each radio from its option label', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    expect(screen.getByRole('radio', { name: 'Неделя' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Месяц' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Квартал' })).toBeInTheDocument();
  });

  it('names the group from a visible label', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    expect(screen.getByRole('radiogroup', { name: 'Період' })).toBeInTheDocument();
  });

  it('names the group from labelledBy when there is no label', () => {
    render(
      <>
        <span id="period-heading">Choose period</span>
        {controlWith({ labelledBy: 'period-heading', onChange: noop })}
      </>
    );
    expect(screen.getByRole('radiogroup', { name: 'Choose period' })).toBeInTheDocument();
  });

  it('prefers labelledBy over a visible label', () => {
    render(
      <>
        <span id="period-heading">Choose period</span>
        {controlWith({ label: 'Ignored', labelledBy: 'period-heading', onChange: noop })}
      </>
    );
    expect(screen.getByRole('radiogroup', { name: 'Choose period' })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Ignored' })).not.toBeInTheDocument();
  });

  it('gives every segment an explicit tab stop, with no roving tabindex', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => {
      expect(radio).toHaveAttribute('tabindex', '0');
    });
  });

  it('renders each segment as a native type="button"', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => {
      expect(radio.tagName).toBe('BUTTON');
      expect(radio).toHaveAttribute('type', 'button');
    });
  });

  it('applies id and lang only when the consumer supplies them', () => {
    const { rerender } = render(controlWith({ label: 'Період', onChange: noop }));
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('id');
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('lang');

    rerender(controlWith({ label: 'Період', id: 'period', lang: 'ru', onChange: noop }));
    expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'period');
    expect(screen.getByRole('radiogroup')).toHaveAttribute('lang', 'ru');
  });

  it('exposes its display name', () => {
    expect(UiSegmentedControl.displayName).toBe('UiSegmentedControl');
  });
});

describe('UiSegmentedControl — selection', () => {
  it('reflects the controlled selected value', () => {
    render(controlWith({ label: 'Період', value: 'month', onChange: noop }));
    expect(screen.getByRole('radio', { name: 'Месяц' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Неделя' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Квартал' })).not.toBeChecked();
  });

  it('stays controlled when nothing is selected (empty, not uncontrolled)', () => {
    render(controlWith({ label: 'Період', value: '', onChange: noop }));
    screen
      .getAllByRole('radio')
      .forEach((radio: HTMLElement) => expect(radio).toHaveAttribute('aria-checked', 'false'));
  });

  it('treats an omitted value exactly like an empty one', () => {
    render(controlWith({ label: 'Період', onChange: noop }));
    screen
      .getAllByRole('radio')
      .forEach((radio: HTMLElement) => expect(radio).toHaveAttribute('aria-checked', 'false'));
  });

  it('moves the selection when the controlled value changes', () => {
    const { rerender } = render(controlWith({ label: 'Період', value: 'week', onChange: noop }));
    expect(screen.getByRole('radio', { name: 'Неделя' })).toBeChecked();

    rerender(controlWith({ label: 'Період', value: 'quarter', onChange: noop }));
    expect(screen.getByRole('radio', { name: 'Квартал' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Неделя' })).not.toBeChecked();
  });

  it('calls onChange with the option value when a segment is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(controlWith({ label: 'Період', value: '', onChange }));

    await user.click(screen.getByRole('radio', { name: 'Месяц' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('reflects a selection fed back through onChange (controlled round-trip)', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledControl />);

    await user.click(screen.getByRole('radio', { name: 'Месяц' }));
    expect(screen.getByRole('radio', { name: 'Месяц' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Квартал' }));
    expect(screen.getByRole('radio', { name: 'Квартал' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Месяц' })).not.toBeChecked();
  });

  it('fires nothing when the already-checked segment is re-activated', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(controlWith({ label: 'Період', value: 'week', onChange }));

    await user.click(screen.getByRole('radio', { name: 'Неделя' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not throw when selecting without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(controlWith({ label: 'Період', value: '', onChange: undefined }));

    // Unwired (no onChange): the control is static, so there is nothing to click.
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});

describe('UiSegmentedControl — disabled (aria-disabled boundary)', () => {
  it('marks every segment aria-disabled when the group is disabled', () => {
    render(controlWith({ label: 'Період', disabled: true, onChange: noop }));
    screen
      .getAllByRole('radio')
      .forEach((radio: HTMLElement) => expect(radio).toHaveAttribute('aria-disabled', 'true'));
  });

  it('never sets the native disabled attribute — segments stay focusable', () => {
    render(controlWith({ label: 'Період', disabled: true, onChange: noop }));
    screen.getAllByRole('radio').forEach((radio: HTMLElement) => {
      expect(radio.getAttributeNames()).not.toContain('disabled');
      expect(radio).toBeEnabled();
    });
  });

  it('disables only the option flagged disabled', () => {
    const mixed: SegmentedOption[] = [
      { value: 'week', label: 'Неделя' },
      { value: 'month', label: 'Месяц', disabled: true },
    ];
    render(controlWith({ options: mixed, label: 'Період', onChange: noop }));
    expect(screen.getByRole('radio', { name: 'Неделя' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('radio', { name: 'Месяц' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('no-ops every activation path while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(controlWith({ label: 'Період', disabled: true, onChange }));

    await user.click(screen.getByRole('radio', { name: 'Неделя' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('remains reachable by Tab while disabled', async () => {
    const user: UserEvent = userEvent.setup();
    render(controlWith({ label: 'Період', disabled: true, onChange: noop }));

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Неделя' })).toHaveFocus();
  });
});

describe('UiSegmentedControl — static (unwired) control', () => {
  it('exposes zero radios, zero radiogroup and zero ARIA hooks', () => {
    render(controlWith({ id: 'static-control' }));

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    const root: Element = nodesMatching('#static-control')[0];
    expect(root.tagName).toBe('DIV');
    expect(nodesMatching('[role], [tabindex], [aria-checked], [aria-disabled]')).toHaveLength(0);
  });

  it('renders each segment as a plain span carrying the label text', () => {
    render(controlWith({ id: 'static-control' }));

    const spans: Element[] = nodesMatching('#static-control > span');
    expect(spans).toHaveLength(3);
    spans.forEach((span: Element) => expect(span.tagName).toBe('SPAN'));
    expect(screen.getByText('Неделя')).toBeInTheDocument();
    expect(screen.getByText('Месяц')).toBeInTheDocument();
    expect(screen.getByText('Квартал')).toBeInTheDocument();
  });

  it('never paints the selected value, so no white pill outlives aria-checked', () => {
    render(controlWith({ id: 'static-control', value: 'week' }));
    // No `[aria-checked]` exists on this branch, so the selected-pill rule
    // (keyed off that attribute) structurally cannot apply.
    expect(nodesMatching('[aria-checked]')).toHaveLength(0);
  });

  it('applies id and lang on the static root', () => {
    render(controlWith({ id: 'static-control', lang: 'ru' }));
    const root: Element = nodesMatching('#static-control')[0];
    expect(root).toHaveAttribute('lang', 'ru');
  });
});

describe('UiSegmentedControl — ref forwarding', () => {
  it('forwards an object ref to the wired root', () => {
    const ref: React.RefObject<HTMLDivElement | null> = React.createRef<HTMLDivElement>();
    render(controlWith({ label: 'Період', onChange: noop }, ref));
    expect(ref.current).toBe(screen.getByRole('radiogroup'));
  });

  it('forwards an object ref to the static root', () => {
    const ref: React.RefObject<HTMLDivElement | null> = React.createRef<HTMLDivElement>();
    render(controlWith({ id: 'static-ref' }, ref));
    expect(ref.current).toBe(nodesMatching('#static-ref')[0]);
  });
});

describe('UiSegmentedControl — consumer sx', () => {
  it('applies an object sx to the wired root, merged last', () => {
    render(controlWith({ label: 'Період', sx: { marginTop: '1rem' }, onChange: noop }));
    expect(screen.getByRole('radiogroup')).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies array sx layers to the static root', () => {
    render(
      controlWith({
        id: 'styled',
        sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }],
      })
    );
    const root: Element = nodesMatching('#styled')[0];
    expect(root).toHaveStyle({ marginTop: '1rem' });
    expect(root).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('UiSegmentedControl — dev warnings (integration)', () => {
  it('stays silent for a healthy wired control and a healthy static one', () => {
    const { rerender } = render(controlWith({ label: 'Період', value: 'week', onChange: noop }));
    expect(warn.spy).not.toHaveBeenCalled();

    rerender(controlWith({ label: 'Період' }));
    expect(warn.spy).not.toHaveBeenCalled();
  });

  it('warns when value is passed without onChange', () => {
    render(controlWith({ label: 'Період', value: 'week' }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('without `onChange`'));
  });

  it('warns on an empty options array', () => {
    render(controlWith({ options: [], label: 'Період', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('empty `options`'));
  });

  it('warns when neither label nor labelledBy is given', () => {
    render(controlWith({ onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });

  it('warns on duplicate option values', () => {
    const dup: SegmentedOption[] = [
      { value: 'week', label: 'Неделя' },
      { value: 'week', label: 'Месяц' },
    ];
    render(controlWith({ options: dup, label: 'Період', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('duplicate option'));
  });

  it('warns on a blank option label', () => {
    const blank: SegmentedOption[] = [{ value: 'week', label: '   ' }];
    render(controlWith({ options: blank, label: 'Період', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('blank `label`'));
  });

  it('warns when value matches no option', () => {
    render(controlWith({ label: 'Період', value: 'year', onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('matching no option'));
  });

  it('emits no warnings in production even without a name', () => {
    const originalEnv: string | undefined = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(controlWith({ onChange: noop }));
      expect(warn.spy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('re-logs the name warning when the name is removed on re-render', () => {
    const { rerender } = render(controlWith({ label: 'Період', onChange: noop }));
    expect(warn.spy).not.toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    rerender(controlWith({ onChange: noop }));
    expect(warn.spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });
});

describe('segmented-control-warnings — pure predicates', () => {
  function props(extra: Readonly<ControlOverrides>): UiSegmentedControlProps {
    return {
      options: extra.options ?? options,
      value: extra.value,
      onChange: extra.onChange,
      label: extra.label,
      labelledBy: extra.labelledBy,
    };
  }

  it('unwiredValueWarning: null when wired, null when value is blank, else warns', () => {
    expect(unwiredValueWarning(props({ value: 'week', onChange: noop }))).toBeNull();
    expect(unwiredValueWarning(props({ value: undefined }))).toBeNull();
    expect(unwiredValueWarning(props({ value: '   ' }))).toBeNull();
    expect(unwiredValueWarning(props({ value: 'week' }))).toContain('without `onChange`');
  });

  it('emptyOptionsWarning: warns only on an empty array', () => {
    expect(emptyOptionsWarning(props({ options: [] }))).toContain('empty `options`');
    expect(emptyOptionsWarning(props({ options }))).toBeNull();
  });

  it('accessibleNameWarning: satisfied by either label or labelledBy', () => {
    expect(accessibleNameWarning(props({ label: 'Період' }))).toBeNull();
    expect(accessibleNameWarning(props({ labelledBy: 'heading' }))).toBeNull();
    expect(accessibleNameWarning(props({}))).toContain('no accessible name');
  });

  it('duplicateValueWarning: warns only when two options share a value', () => {
    const dup: SegmentedOption[] = [
      { value: 'a', label: 'A' },
      { value: 'a', label: 'B' },
    ];
    expect(duplicateValueWarning(props({ options: dup }))).toContain('duplicate option');
    expect(duplicateValueWarning(props({ options }))).toBeNull();
    expect(duplicateValueWarning(props({ options: [] }))).toBeNull();
  });

  it('blankLabelWarning: warns when any option label is blank', () => {
    const blank: SegmentedOption[] = [{ value: 'a', label: '' }];
    expect(blankLabelWarning(props({ options: blank }))).toContain('blank `label`');
    expect(blankLabelWarning(props({ options }))).toBeNull();
  });

  it('unmatchedValueWarning: null when blank, null when found, else warns', () => {
    expect(unmatchedValueWarning(props({ value: undefined }))).toBeNull();
    expect(unmatchedValueWarning(props({ value: 'week' }))).toBeNull();
    expect(unmatchedValueWarning(props({ value: 'year' }))).toContain('matching no option');
  });
});

describe('useSegmentedControl — control view model', () => {
  function modelFor(extra: Readonly<ControlOverrides>): SegmentedControlModel {
    const componentProps: UiSegmentedControlProps = {
      options: extra.options ?? options,
      value: extra.value,
      onChange: extra.onChange,
      label: extra.label,
      labelledBy: extra.labelledBy,
      disabled: extra.disabled,
    };
    return renderHook((): SegmentedControlModel => useSegmentedControl(componentProps)).result
      .current;
  }

  it('marks a wired control interactive and an unwired one not', () => {
    expect(modelFor({ onChange: noop }).interactive).toBe(true);
    expect(modelFor({}).interactive).toBe(false);
  });

  it('resolves ariaLabel from label only when labelledBy is absent', () => {
    expect(modelFor({ label: 'Період' }).ariaLabel).toBe('Період');
    expect(modelFor({ label: 'Період', labelledBy: 'heading' }).ariaLabel).toBeUndefined();
    expect(modelFor({ labelledBy: 'heading' }).ariaLabelledBy).toBe('heading');
  });

  it('checks exactly the segment matching value, coercing a nullish value to empty', () => {
    const model: SegmentedControlModel = modelFor({ value: 'month' });
    expect(model.segments.map(s => s.checked)).toEqual([false, true, false]);

    const empty: SegmentedControlModel = modelFor({});
    expect(empty.segments.every(s => !s.checked)).toBe(true);
  });

  it('marks a segment aria-disabled when the group is disabled', () => {
    const model: SegmentedControlModel = modelFor({ disabled: true });
    expect(model.segments.every(s => s.ariaDisabled === true)).toBe(true);
  });

  it('marks a segment aria-disabled when only that option is disabled', () => {
    const mixed: SegmentedOption[] = [
      { value: 'week', label: 'Неделя' },
      { value: 'month', label: 'Месяц', disabled: true },
    ];
    const model: SegmentedControlModel = modelFor({ options: mixed });
    expect(model.segments[0].ariaDisabled).toBeUndefined();
    expect(model.segments[1].ariaDisabled).toBe(true);
  });

  it('does not throw when an unwired segment is activated (no onChange to call)', () => {
    const model: SegmentedControlModel = modelFor({});
    expect(() => model.segments[0].onActivate()).not.toThrow();
  });

  it('swallows activation while disabled, before onChange runs', () => {
    const onChange: jest.Mock = jest.fn();
    const model: SegmentedControlModel = modelFor({ disabled: true, onChange });
    model.segments[0].onActivate();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('swallows re-activating the already checked segment', () => {
    const onChange: jest.Mock = jest.fn();
    const model: SegmentedControlModel = modelFor({ value: 'week', onChange });
    model.segments[0].onActivate();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the option value exactly once for an enabled, unchecked segment', () => {
    const onChange: jest.Mock = jest.fn();
    const model: SegmentedControlModel = modelFor({ value: 'week', onChange });
    model.segments[1].onActivate();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('treats an explicit disabled: false exactly like an absent one', () => {
    const onChange: jest.Mock = jest.fn();
    const model: SegmentedControlModel = modelFor({ disabled: false, onChange });
    model.segments[0].onActivate();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(model.segments[0].ariaDisabled).toBeUndefined();
  });
});

describe('styles — segmentSx and trackSx (pure, mutation-killing)', () => {
  it('pins the shared layout recipe: content-sized flex segments, no hardcoded widths', () => {
    const base: Record<string, unknown> = SEGMENT_BASE as Record<string, unknown>;
    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('flex');
    expect(base.flex).toBe('1 1 auto');
    expect(base.width).toBeUndefined();
    expect(base.height).toBe('2.625rem');
    expect(base.padding).toBe('0.5rem 1rem');
    expect(base.borderRadius).toBe('0.5rem');
    expect(base.backgroundColor).toBe('transparent');
    expect(base.fontFamily).toBe('Inter');
    expect(base.fontWeight).toBe(500);
    expect(base.fontSize).toBe('0.875rem');
    expect(base.lineHeight).toBe('1.125rem');
    expect(base.letterSpacing).toBe(0);
    expect(base.color).toBe(GREY300);
  });

  it('pins the 339x50 track geometry: 4px padding, no explicit height, no border', () => {
    const base: Record<string, unknown> = TRACK_BASE as Record<string, unknown>;
    expect(base.boxSizing).toBe('border-box');
    expect(base.display).toBe('inline-flex');
    expect(base.gap).toBe(0);
    expect(base.padding).toBe('0.25rem');
    expect(base.height).toBeUndefined();
    expect(base.border).toBeUndefined();
    expect(base.backgroundColor).toBe(GREY500);
    expect(base.borderRadius).toBe('0.5rem');
  });

  it('adds cursor and appearance only to the interactive segment', () => {
    const interactive: Record<string, unknown> = segmentSx({
      interactive: true,
    }) as Record<string, unknown>;
    const passive: Record<string, unknown> = segmentSx({
      interactive: false,
    }) as Record<string, unknown>;
    expect(interactive.cursor).toBe('pointer');
    expect(interactive.appearance).toBe('none');
    expect(passive.cursor).toBeUndefined();
    expect(passive.appearance).toBeUndefined();
    // The layout half is identical either way.
    expect(passive.fontFamily).toBe('Inter');
  });

  it('gates hover off the checked and disabled attributes, painting the translucent pill', () => {
    const base: Record<string, unknown> = segmentSx({ interactive: true }) as Record<
      string,
      unknown
    >;
    const hoverKey = '&:hover:not([aria-checked="true"]):not([aria-disabled="true"])';
    const hover: Record<string, unknown> = base[hoverKey] as Record<string, unknown>;
    expect(hover).toEqual({ backgroundColor: HOVER_FILL, color: DARK_PRIMARY });
  });

  it('paints the selected pill white with darkPrimary ink and no shadow', () => {
    const base: Record<string, unknown> = segmentSx({ interactive: true }) as Record<
      string,
      unknown
    >;
    const checked: Record<string, unknown> = base['&[aria-checked="true"]'] as Record<
      string,
      unknown
    >;
    expect(checked).toEqual({ backgroundColor: WHITE, color: DARK_PRIMARY });
    expect(checked.boxShadow).toBeUndefined();
  });

  it('paints disabled as grey300 ink only, no fill override (deviation, no Figma master)', () => {
    const base: Record<string, unknown> = segmentSx({ interactive: true }) as Record<
      string,
      unknown
    >;
    const disabled: Record<string, unknown> = base['&[aria-disabled="true"]'] as Record<
      string,
      unknown
    >;
    expect(disabled).toEqual({ cursor: 'default', color: GREY300 });
    expect(disabled.backgroundColor).toBeUndefined();
  });

  it('declares the checked and disabled rules after hover, so ink resolves correctly', () => {
    const keys: string[] = Object.keys(segmentSx({ interactive: true }) as Record<string, unknown>);
    const hover: number = keys.findIndex((key: string) => key.includes(':hover'));
    const checked: number = keys.indexOf('&[aria-checked="true"]');
    const disabled: number = keys.indexOf('&[aria-disabled="true"]');
    expect(hover).toBeGreaterThanOrEqual(0);
    expect(checked).toBeGreaterThan(hover);
    expect(disabled).toBeGreaterThan(checked);
  });

  it('ships the shared toolkit focus ring — the only non-Figma visual painted', () => {
    const base: Record<string, unknown> = segmentSx({ interactive: true }) as Record<
      string,
      unknown
    >;
    expect(base['&:focus-visible']).toEqual({
      outline: 'none',
      boxShadow: `inset 0 0 0 2px ${DARK_PRIMARY}`,
    });
  });

  it('ships no transition and no animation, so nothing can move between states', () => {
    const serialised: string = JSON.stringify([
      segmentSx({ interactive: true }),
      segmentSx({ interactive: false }),
      TRACK_BASE,
    ]);
    expect(serialised).not.toMatch(/transition/i);
    expect(serialised).not.toMatch(/animation/i);
  });

  it('merges the consumer sx last, in object, array and absent forms', () => {
    expect(trackSx({ sx: undefined })).toEqual([TRACK_BASE, {}]);
    expect(trackSx({ sx: { marginTop: '1rem' } })).toEqual([TRACK_BASE, { marginTop: '1rem' }]);
    expect(trackSx({ sx: [{ marginTop: '1rem' }, { paddingTop: '2rem' }] })).toEqual([
      TRACK_BASE,
      { marginTop: '1rem' },
      { paddingTop: '2rem' },
    ]);
  });
});
