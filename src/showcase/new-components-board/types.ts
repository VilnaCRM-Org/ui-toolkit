import type React from 'react';

export interface StateSpec {
  label: string;
  node: React.ReactNode;
  /** Open/dropdown tiles need vertical room for the inline popper. */
  tall?: boolean | undefined;
  /** Overrides the group width, for responsive-variant tiles (tablet/mobile). */
  width?: number | undefined;
}

export interface GroupSpec {
  title: string;
  /** The Figma component width, in px, so each tile matches the design 1:1. */
  width: number;
  states: StateSpec[];
}
