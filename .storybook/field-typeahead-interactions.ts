import { expect, screen, userEvent, within } from 'storybook/test';

// Shared `play` body for the typeahead field controls (UiSearchInput,
// UiSelectWithSearch). Both prove the same contract — typing narrows the listbox
// and clicking a surviving option writes it into the field — so the interaction
// lives here once instead of being duplicated per story module.
// See tests/storybook/README.md.

/** What a typeahead narrow-and-select interaction needs to drive one field. */
export interface TypeaheadSelection {
  /** The story's canvas root, from the `play` context. */
  canvasElement: HTMLElement;
  /** Accessible name of the combobox under test. */
  fieldName: string;
  /** Text typed into the field to narrow the listbox. */
  query: string;
  /** Option that must survive `query` and become the field's value. */
  chosenOption: string;
  /** Option that `query` must filter out of the listbox. */
  filteredOutOption: string;
}

/**
 * Types `query` into the named combobox, asserts `filteredOutOption` is gone from
 * the listbox, clicks `chosenOption` and asserts it became the field's value.
 *
 * The listbox is portalled outside the story canvas, so options are queried from
 * `screen` while the field itself is queried from within the canvas.
 */
export async function expectTypeaheadNarrowsAndSelects({
  canvasElement,
  fieldName,
  query,
  chosenOption,
  filteredOutOption,
}: TypeaheadSelection): Promise<void> {
  const field: HTMLElement = within(canvasElement).getByRole('combobox', { name: fieldName });

  await userEvent.type(field, query);
  const match: HTMLElement = await screen.findByRole('option', { name: chosenOption });

  await expect(screen.queryByRole('option', { name: filteredOutOption })).toBeNull();

  await userEvent.click(match);

  await expect(field).toHaveValue(chosenOption);
}
