import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  booleanControlArgType,
  numberControlArgType,
  selectControlArgType,
  textControlArgType,
} from '../../../.storybook/field-story-arg-types';

import type { UiFileUploadInputProps } from './types';

import UiFileUploadInput from './index';

const ACCEPT: string = '.png,.jpg,.jpeg';
const MAX_SIZE_BYTES: number = 2 * 1024 * 1024;
const LABEL: string = 'Логотип проєкту';
const BUTTON_LABEL: string = 'Загрузити';

// The selection is always controlled, so the interactive story seeds it from
// local state. Props are threaded explicitly (the repo forbids prop-spreading).
function FileUploadStory({ args }: { args: UiFileUploadInputProps }): React.ReactElement {
  const [files, setFiles] = React.useState<readonly File[]>([]);

  return (
    <UiFileUploadInput
      files={files}
      onFilesChange={setFiles}
      accept={args.accept}
      maxSizeBytes={args.maxSizeBytes}
      multiple={args.multiple}
      label={args.label}
      helperText={args.helperText}
      disabled={args.disabled}
      required={args.required}
      error={args.error}
    />
  );
}

const meta: Meta<typeof UiFileUploadInput> = {
  title: 'UiComponents/UiFileUploadInput',
  component: UiFileUploadInput,
  tags: ['autodocs'],
  // The control is fluid so it fits whatever form hosts it; the stories pin it to
  // the Figma field width (422px, node 449:25703) the way a consumer would.
  decorators: [
    (Story: React.ComponentType): React.ReactElement => (
      <Box sx={{ maxWidth: '26.375rem' }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    label: textControlArgType('Visible field label / accessible name'),
    helperText: textControlArgType('Constraint hint, or the reason an upload failed'),
    buttonLabel: textControlArgType('Text on the pill that opens the file picker'),
    accept: textControlArgType('Accepted types, e.g. ".png,.jpg" or "image/*"'),
    maxSizeBytes: numberControlArgType('Largest accepted size per file, in bytes'),
    progress: numberControlArgType('Completion percentage (0–100) while uploading'),
    status: selectControlArgType('Async upload lifecycle', [
      'idle',
      'uploading',
      'success',
      'error',
    ]),
    multiple: booleanControlArgType('Allows picking more than one file at a time'),
    disabled: booleanControlArgType('Whether the field is disabled'),
    error: booleanControlArgType('Whether the field is in error state'),
    required: booleanControlArgType('Marks the field required for assistive technology'),
  },
};

export default meta;

type Story = StoryObj<typeof UiFileUploadInput>;

/**
 * Interactive resting state. Pick a file with the pill (or the keyboard: Tab to
 * it, then Enter) **or drag one onto the field** — both paths run the same
 * type/size validation, so dropping a `.pdf` or an oversized image surfaces an
 * actionable rejection message instead of selecting it.
 */
export const FileUploadInput: Story = {
  args: {
    label: LABEL,
    buttonLabel: BUTTON_LABEL,
    accept: ACCEPT,
    maxSizeBytes: MAX_SIZE_BYTES,
  },
  render: (args: UiFileUploadInputProps): React.ReactElement => <FileUploadStory args={args} />,
};

/** Figma's only file-upload error state: a red stroke plus the reason below the
 * field (no status pill). */
export const UploadError: Story = {
  args: {
    label: LABEL,
    buttonLabel: BUTTON_LABEL,
    error: true,
    helperText: 'Виникла помилка. Перевірте ще раз',
  },
  render: (args: UiFileUploadInputProps): React.ReactElement => <FileUploadStory args={args} />,
};
