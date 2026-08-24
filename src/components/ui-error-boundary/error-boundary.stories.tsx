import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import UiButton from '../ui-button';
import UiTypography from '../ui-typography';

import type { UiErrorBoundaryReset } from './types';

import UiErrorBoundary from './index';

// Determinism contract shared by all three stories: the throwing child is
// declared at module scope and throws unconditionally on first render, so every
// load lands on the same fallback pixels. Nothing below reads a timer, a random
// value, a date, or the caught error's message.
const DEMO_ERROR_MESSAGE: string = 'Storybook demo failure';

function Boom(): React.ReactElement {
  throw new Error(DEMO_ERROR_MESSAGE);
}

// A single element instance, reused by every story.
const BOOM: React.ReactElement = <Boom />;

const CUSTOM_NODE: React.ReactElement = (
  <UiTypography variant="bodyText16" component="p">
    This panel is unavailable right now.
  </UiTypography>
);

// `.storybook/preview.ts` sets `actions: { argTypesRegex: '^on[A-Z].*' }`, which
// injects an implicit action spy for `onError`. `componentDidCatch` calls that
// spy while the story is still rendering, which makes Storybook throw
// SB_PREVIEW_API_0002 and blank the canvas. Supplying `onError` explicitly
// replaces the implicit spy, so the fallback renders. It stays a no-op: nothing
// it could do would be deterministic in a pixel baseline.
function handleBoundaryError(): void {}

// Captured at rest: the baseline never hovers, focuses, or clicks this button.
function renderTryAgain(_error: Error, reset: UiErrorBoundaryReset): React.ReactElement {
  return (
    <UiButton type="button" variant="contained" size="small" onClick={reset}>
      Try again
    </UiButton>
  );
}

const meta: Meta<typeof UiErrorBoundary> = {
  title: 'UiComponents/UiErrorBoundary',
  component: UiErrorBoundary,
  tags: ['autodocs'],
  args: {
    onError: handleBoundaryError,
  },
  argTypes: {
    fallback: { control: false },
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof UiErrorBoundary>;

export const DefaultFallback: Story = {
  args: {
    children: BOOM,
  },
};

export const CustomNodeFallback: Story = {
  args: {
    children: BOOM,
    fallback: CUSTOM_NODE,
  },
};

export const RenderPropFallback: Story = {
  args: {
    children: BOOM,
    fallback: renderTryAgain,
  },
};
