import { Box } from '@mui/material';
import type { AutocompleteRenderOptionState } from '@mui/material';
import React from 'react';

import colorTheme from '../ui-color-theme';

const palette: (typeof colorTheme)['palette'] = colorTheme.palette;

// Figma (node 439:19399) renders each suggestion as two runs: the part the user has
// already typed in the dark value ink, and the remaining completion in the grey
// placeholder ink — so the typed prefix reads normally and the suggestion reads
// muted. The split is a case-insensitive prefix match; a non-prefix option (or an
// empty query, before anything is typed) reads fully dark, i.e. rendered normally.
//
// MUI's `renderOption` requires its `<li>` prop bag (click/hover handlers, aria,
// key, data-option-index) to be applied to the element. The eslint config forbids
// JSX prop spreading on a bare `<li>` (only whitelisted MUI components are exempt),
// so the element is built with `React.createElement`, which passes the prop object
// explicitly — no JSX spread, no eslint-disable, no config change.
export function renderSearchOption(
  optionProps: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
  option: string,
  state: AutocompleteRenderOptionState
): React.ReactElement {
  const input: string = state.inputValue;
  const isPrefix: boolean =
    input.length > 0 && option.toLowerCase().startsWith(input.toLowerCase());
  const splitAt: number = isPrefix ? input.length : option.length;
  // The two runs are separate elements, so the name-from-contents algorithm joins
  // them with a space ("Top perf ormers"); label the row with the whole suggestion
  // so assistive tech announces it intact (WCAG 2.5.3, and the visible text matches).
  return React.createElement(
    'li',
    { ...optionProps, 'aria-label': option },
    <Box component="span" sx={{ color: palette.darkPrimary.main }}>
      {option.slice(0, splitAt)}
    </Box>,
    <Box component="span" sx={{ color: palette.grey300.main }}>
      {option.slice(splitAt)}
    </Box>
  );
}
