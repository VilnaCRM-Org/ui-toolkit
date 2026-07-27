import type { ArgTypes } from '@storybook/react';

// Shared Storybook `argTypes` builders for the field controls (UiSearchInput,
// UiSelectWithSearch, UiMultiSelect, UiFileUploadInput). Their control
// definitions are structurally identical, so the shape lives here once and each
// story supplies its own description — keeping the stories free of duplicated
// argType literals.
type FieldArgType = ArgTypes[string];

export function textControlArgType(description: string): FieldArgType {
  return { type: 'string', description, control: { type: 'text' } };
}

export function booleanControlArgType(description: string): FieldArgType {
  return { type: 'boolean', description, control: { type: 'boolean' } };
}

export function numberControlArgType(description: string): FieldArgType {
  return { type: 'number', description, control: { type: 'number' } };
}

export function selectControlArgType(description: string, options: string[]): FieldArgType {
  return { type: 'string', description, control: { type: 'select' }, options };
}

// A JSON object/array editor, so a story reader can supply their own value —
// e.g. edit a multi-select's `options`/`value` arrays directly in the Controls panel.
export function objectControlArgType(description: string): FieldArgType {
  return { description, control: { type: 'object' } };
}
