import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiCopyFieldProps } from './types';

import UiCopyField from './index';

// The Figma Board A sample string, verbatim.
const SAMPLE_VALUE: string = '5POLGOPWQZFCCFEI';

const meta: Meta<typeof UiCopyField> = {
  title: 'UiComponents/UiCopyField',
  component: UiCopyField,
  tags: ['autodocs'],
  argTypes: {
    value: textControlArgType('The visible code string this chip copies'),
    copyLabel: textControlArgType('Hidden suffix; defaults to "Копіювати"'),
    disabled: booleanControlArgType('aria-disabled boundary: still focusable, copy no-ops'),
    lang: textControlArgType('Only when the code differs from the page language'),
  },
};

export default meta;

type Story = StoryObj<typeof UiCopyField>;

// Props are applied one by one — the repo forbids JSX spreading onto
// UiCopyField (that exemption is reserved for TextField/FormProvider/Button/
// Typography/UiInput).
function renderCopyField(args: UiCopyFieldProps): React.ReactElement {
  return (
    <UiCopyField
      value={args.value}
      copyLabel={args.copyLabel}
      disabled={args.disabled}
      id={args.id}
      lang={args.lang}
    />
  );
}

// The primary story: the rest state, pixel-for-pixel with the Figma Board A
// master.
export const CopyField: Story = {
  args: { value: SAMPLE_VALUE },
  render: renderCopyField,
};
