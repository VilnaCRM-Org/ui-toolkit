import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  numberControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiPinInputProps } from './types';

import UiPinInput from './index';

// Ukrainian sample content (Ruling 7): the component bakes in only the per-cell
// default name, so the group name and the helper copy are consumer data.
const GROUP_LABEL: string = 'Код підтвердження';
const HELPER_TEXT: string = 'Введіть 6 цифр, надіслані у SMS';
const ERROR_TEXT: string = 'Невірний код. Спробуйте ще раз';

// The `labelledBy` half of the naming contract belongs to the consumer: the
// component names its `role="group"` from an element it does not render.
const VISIBLE_LABEL_ID: string = 'ui-pin-input-story-label';

const PIN_LENGTH: number = 6;

/**
 * The field is always controlled (§ "Always-controlled") — it never self-flips a
 * digit — so a stateful wrapper owns the string and `onChange` feeds it back,
 * keeping the story typable, pasteable and OTP-autofillable. Storybook Controls
 * drive the initial value and every other prop; props are threaded explicitly,
 * since the repo forbids prop-spreading.
 */
function PinInputStory({ args }: Readonly<{ args: UiPinInputProps }>): React.ReactElement {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  // Adopt `value` changes from Controls while keeping typing interactive.
  React.useEffect((): void => {
    setValue(args.value ?? '');
  }, [args.value]);
  return (
    <UiPinInput
      label={args.label}
      value={value}
      onChange={setValue}
      length={args.length}
      required={args.required}
      error={args.error}
      helperText={args.helperText}
      disabled={args.disabled}
    />
  );
}

const meta: Meta<typeof UiPinInput> = {
  title: 'UiComponents/UiPinInput',
  component: UiPinInput,
  tags: ['autodocs'],
  argTypes: {
    label: textControlArgType('Group accessible name (aria-label); required in practice'),
    value: textControlArgType('The entered digits, concatenated — filtered and clamped'),
    length: numberControlArgType('Cell count; default 6, normalised to at least 1'),
    required: booleanControlArgType('aria-required on the FIRST cell only'),
    error: booleanControlArgType('aria-invalid on every cell; always pair with helperText'),
    helperText: textControlArgType('Rendered once below the group, linked from every cell'),
    disabled: booleanControlArgType('readOnly + aria-disabled boundary; cells stay focusable'),
  },
};

export default meta;

type Story = StoryObj<typeof UiPinInput>;

// Wired render: `onChange` is what makes the cells editable, so typing, the
// Backspace/Delete/Arrow table, paste distribution and the focus ring are live.
function renderWired(args: UiPinInputProps): React.ReactElement {
  return <PinInputStory args={args} />;
}

// Unwired render: no `onChange`, so every cell is `readOnly` and the field is
// read-only content over an identical tree. It also models the `labelledBy` half
// of the naming contract — a visible label the consumer owns.
function renderStatic(args: UiPinInputProps): React.ReactElement {
  return (
    <Box>
      <Box component="p" id={VISIBLE_LABEL_ID}>
        {GROUP_LABEL}
      </Box>
      <UiPinInput labelledBy={VISIBLE_LABEL_ID} value={args.value} length={args.length} />
    </Box>
  );
}

// The primary story: the empty wired field, one Figma "2FA item" master per cell.
export const PinInput: Story = {
  args: { label: GROUP_LABEL, value: '', length: PIN_LENGTH },
  render: renderWired,
};

// A partially entered code: entered digits paint `darkPrimary`, empty cells keep
// the grey placeholder "0" that all four Figma masters draw.
export const Filled: Story = {
  args: { label: GROUP_LABEL, value: '482', length: PIN_LENGTH, required: true },
  render: renderWired,
};

// `aria-invalid` on every cell plus the helper text below — the non-colour signal
// that keeps the error from being colour-only.
export const WithError: Story = {
  args: {
    label: GROUP_LABEL,
    value: '4821',
    length: PIN_LENGTH,
    error: true,
    helperText: ERROR_TEXT,
  },
  render: renderWired,
};

// The Ruling-3 boundary: `readOnly` + `aria-disabled` on every cell, native
// `disabled` never set, so focus is never dropped when a focused field flips.
export const Disabled: Story = {
  args: { label: GROUP_LABEL, value: '482100', length: PIN_LENGTH, disabled: true },
  render: renderWired,
};

// Helper text without an error: the same one-per-field description, linked from
// every cell through `aria-describedby`.
export const WithHelperText: Story = {
  args: { label: GROUP_LABEL, value: '', length: PIN_LENGTH, helperText: HELPER_TEXT },
  render: renderWired,
};

export const Static: Story = {
  args: { value: '482100', length: PIN_LENGTH },
  render: renderStatic,
};
