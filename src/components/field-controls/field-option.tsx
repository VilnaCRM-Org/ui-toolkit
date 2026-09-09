import { Box } from '@mui/material';
import type { AutocompleteRenderOptionState } from '@mui/material';
import React from 'react';

import colorTheme from '../ui-color-theme';

import { splitOnPrefix } from './ghost-completion';

const palette: (typeof colorTheme)['palette'] = colorTheme.palette;

/** MUI's `<li>` prop bag for a rendered option (click/hover/aria/key). */
export type OptionProps = React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };

/** The `renderOption` callback shape shared by the search and multi-select listboxes. */
export type FieldOptionRenderer<Option> = (
  optionProps: OptionProps,
  option: Option,
  state: AutocompleteRenderOptionState
) => React.ReactElement;

// Figma (search node 439:19399, multiselect 535:37501) renders each suggestion as
// two runs: the part the user has already typed in the dark value ink, and the
// remaining completion in the grey placeholder ink — so the typed prefix reads
// normally and the suggestion reads muted. The split is the shared case-insensitive
// prefix match (`splitOnPrefix`); a non-prefix option (or an empty query, before
// anything is typed) reads fully dark.
//
// MUI's `renderOption` requires its `<li>` prop bag (click/hover handlers, aria, key,
// data-option-index) to be applied to the element. The eslint config forbids JSX prop
// spreading on a bare `<li>` (only whitelisted MUI components are exempt), so the
// element is built with `React.createElement`, which passes the prop object
// explicitly — no JSX spread, no eslint-disable, no config change.
export function createFieldOptionRenderer<Option>(
  getLabel: (option: Option) => string
): FieldOptionRenderer<Option> {
  return function renderFieldOption(optionProps, option, state): React.ReactElement {
    const label: string = getLabel(option);
    const [head, tail]: [string, string] = splitOnPrefix(label, state.inputValue);
    // The two runs are separate elements, so the name-from-contents algorithm joins
    // them with a space; label the row with the whole suggestion so assistive tech
    // announces it intact (WCAG 2.5.3, and the visible text matches). `whiteSpace: pre`
    // keeps the separating space that lives at the head/tail boundary — MUI's option
    // <li> is display:flex, so each run is a flex item that would otherwise trim its
    // own leading/trailing whitespace and glue the two words together.
    return React.createElement(
      'li',
      { ...optionProps, 'aria-label': label },
      <Box component="span" sx={{ color: palette.darkPrimary.main, whiteSpace: 'pre' }}>
        {head}
      </Box>,
      <Box component="span" sx={{ color: palette.grey300.main, whiteSpace: 'pre' }}>
        {tail}
      </Box>
    );
  };
}
