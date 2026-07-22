import { Box } from '@mui/material';
import type { AutocompleteRenderOptionState } from '@mui/material';
import React from 'react';

import colorTheme from '../ui-color-theme';

const palette: (typeof colorTheme)['palette'] = colorTheme.palette;

// Figma (node 439:19399) renders each suggestion as two runs: the part the user
// has already typed in the dark value ink, and the remaining completion in the
// grey placeholder ink — so the typed prefix reads normally and the suggestion
// reads muted. The split is a case-insensitive prefix match; a non-prefix option
// stays fully grey (nothing has been typed toward it).
export function renderSearchOption(
  optionProps: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
  option: string,
  state: AutocompleteRenderOptionState
): React.ReactElement {
  const input: string = state.inputValue;
  const isPrefix: boolean =
    input.length > 0 && option.toLowerCase().startsWith(input.toLowerCase());
  const splitAt: number = isPrefix ? input.length : 0;
  const { key, ...rest } = optionProps;
  return (
    <li key={key} {...rest}>
      <Box component="span" sx={{ color: palette.darkPrimary.main }}>
        {option.slice(0, splitAt)}
      </Box>
      <Box component="span" sx={{ color: palette.grey300.main }}>
        {option.slice(splitAt)}
      </Box>
    </li>
  );
}
