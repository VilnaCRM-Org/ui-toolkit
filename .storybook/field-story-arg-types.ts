import type { ArgTypes } from '@storybook/react';

// Shared Storybook `argTypes` builders for the field controls (UiSearchInput,
// UiSelectWithSearch, UiMultiSelect). Their control definitions are structurally
// identical, so the shape lives here once and each story supplies its own
// description — keeping the stories free of duplicated argType literals.
type FieldArgType = ArgTypes[string];

export function textControlArgType(description: string): FieldArgType {
  return { type: 'string', description, control: { type: 'text' } };
}

export function booleanControlArgType(description: string): FieldArgType {
  return { type: 'boolean', description, control: { type: 'boolean' } };
}
