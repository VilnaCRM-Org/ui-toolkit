import type { CSSObject } from '@emotion/react';
import type { SxProps, Theme } from '@mui/material';
import { unstable_styleFunctionSx as styleFunctionSx } from '@mui/system';
import type { CSSProperties } from 'react';

export interface InlineStyles {
  style: CSSProperties;
  droppedRules: string[];
}

function isStyleLayer(layer: unknown): layer is CSSObject {
  return typeof layer === 'object' && layer !== null;
}

export function resolveSxLayers(sx: SxProps<Theme>, theme: Theme): CSSObject[] {
  const resolved: unknown = styleFunctionSx({ sx, theme });
  const layers: unknown[] = Array.isArray(resolved) ? resolved : [resolved];
  return layers.filter(isStyleLayer);
}

export function flattenToInline(layers: readonly CSSObject[]): InlineStyles {
  const style: Record<string, unknown> = {};
  const droppedRules: Set<string> = new Set();
  for (const [key, value] of layers.flatMap(layer => Object.entries(layer))) {
    if (isStyleLayer(value)) {
      droppedRules.add(key);
    } else {
      style[key] = value;
    }
  }
  return { style: style as CSSProperties, droppedRules: [...droppedRules] };
}
