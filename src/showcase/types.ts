import type { ReactNode } from 'react';

/** One board tile: a single Figma state of a component, at its Figma width. */
export interface StateSpec {
  label: string;
  node: ReactNode;
  /** Open/dropdown tiles need vertical room for the inline popper. */
  tall?: boolean;
  /** Overrides the group width, for responsive-variant tiles (tablet/mobile). */
  width?: number;
}

/** One board section: every Figma state Figma draws for a single component. */
export interface GroupSpec {
  title: string;
  /** The Figma component width, in px, so each tile matches the design 1:1. */
  width: number;
  states: StateSpec[];
}
