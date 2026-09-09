import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import {
  booleanControlArgType,
  objectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiMultiSelectOption } from './types';

import UiMultiSelect from './index';

// Tuple-typed so indexing a fixed entry (the preselected chips below) stays a
// definite `UiMultiSelectOption` under `noUncheckedIndexedAccess`.
const options: [
  UiMultiSelectOption,
  UiMultiSelectOption,
  UiMultiSelectOption,
  UiMultiSelectOption,
] = [
  { label: 'UX designer', value: 'ux' },
  { label: 'Розробник', value: 'dev' },
  { label: 'Дизайнер', value: 'design' },
  { label: 'Менеджер', value: 'manager' },
];
const interactionLabel: string = 'Роль';
const interactionPlaceholder: string = 'Почніть вводити';
const firstPick: string = options[1].label;
const secondPick: string = options[2].label;

// The combobox is fully controlled, so the interaction story owns the chip set and
// starts from an empty selection.
function MultiSelectInteractionStory(): React.ReactElement {
  const [value, setValue] = React.useState<UiMultiSelectOption[]>([]);

  return (
    <UiMultiSelect
      options={options}
      value={value}
      label={interactionLabel}
      placeholder={interactionPlaceholder}
      onChange={setValue}
    />
  );
}

const meta: Meta<typeof UiMultiSelect> = {
  title: 'UiComponents/UiMultiSelect',
  component: UiMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Visible label / accessible name for the combobox'),
    placeholder: textControlArgType('Placeholder text shown when nothing is selected'),
    disabled: booleanControlArgType('Whether the control is disabled'),
    loading: booleanControlArgType('Whether the options are being fetched'),
    options: objectControlArgType(
      'The selectable options ({ label, value }) — edit to supply your own'
    ),
    // Selection is driven by the story's own state (so picking/removing chips
    // works); the initial chips come from `args.value`, so its panel control is off.
    value: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof UiMultiSelect>;

// Hoisted so the busy story can reuse it by name: reading it back off the story
// object types as `render?: … | undefined`, which `exactOptionalPropertyTypes`
// refuses to assign to another story's own optional `render`.
// A stateful wrapper so the combobox is actually interactive in Storybook —
// UiMultiSelect is controlled, so without local state nothing would change when
// you pick an option or hit the chip delete / clear-all. `options` still comes
// from args, so editing it in the Controls panel supplies your own items.
const renderMultiSelect: NonNullable<Story['render']> = function Render(args): React.ReactElement {
  const [value, setValue] = React.useState<UiMultiSelectOption[]>(args.value ?? []);
  return (
    <UiMultiSelect
      options={args.options}
      label={args.label}
      placeholder={args.placeholder}
      disabled={args.disabled}
      loading={args.loading}
      value={value}
      onChange={setValue}
    />
  );
};

export const MultiSelect: Story = {
  args: {
    options,
    // Two preselected chips give the visual baseline something to render.
    value: [options[0], options[2]],
    label: interactionLabel,
    placeholder: interactionPlaceholder,
  },
};

// This control keeps its clear-all × while loading — the × is Figma-mandated
// always-visible (node 622:44553) — so the arc is drawn as a 32px ring
// concentric with it rather than in its place.
export const Loading: Story = {
  args: {
    options,
    value: [options[0], options[2]],
    label: interactionLabel,
    placeholder: interactionPlaceholder,
    loading: true,
  },
  render: renderMultiSelect,
};

// Interaction story (`interaction` tag): proves picking two options turns them into
// chips inside the field. The listbox is portalled outside the story canvas, so it
// is queried from `screen`. See tests/storybook/README.md.
export const PickingOptionsAddsChips: Story = {
  tags: ['interaction', '!autodocs'],
  render: MultiSelectInteractionStory,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: interactionLabel }));
    await userEvent.click(await screen.findByRole('option', { name: firstPick }));
    await userEvent.click(await screen.findByRole('option', { name: secondPick }));

    await expect(canvas.getByText(firstPick)).toBeVisible();
    await expect(canvas.getByText(secondPick)).toBeVisible();
  },
};
