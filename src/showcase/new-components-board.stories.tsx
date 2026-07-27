import type { Meta, StoryObj } from '@storybook/react';

import Board from './board';

// A "board" that lays every new Epic-2 control (the ones CRM/website lack) out at
// its exact Figma component width, in every state Figma draws. Prop-driven states
// (rest/filled/empty/selected/disabled/error) render directly; interaction states
// Figma draws as separate frames (hover, open dropdown) are forced on statically —
// hover via a wrapper that re-applies the theme's hover visuals, open via the
// `open`/`disablePortal` props so the real dropdown renders inline. Ukrainian copy
// mirrors the Figma frames. Everything is fluid below 480px (mobile). The tiles
// themselves live in the sibling `*-group(s).tsx` modules; `board.tsx` composes
// them into the page.
const meta: Meta<typeof Board> = {
  title: 'Showcase/New Components (Figma parity)',
  component: Board,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Board>;

export const FigmaParity: Story = {};
