import React from 'react';

/**
 * Merges a loading slot into MUI's own end adornment instead of replacing it.
 *
 * The three comboboxes differ in what MUI puts there: UiSearchInput emits no end
 * adornment at all (`freeSolo` + `disableClearable` + `popupIcon={null}`, so
 * neither `hasClearIcon` nor `hasPopupIcon` is set), while the two selects emit
 * the absolutely-positioned `.MuiAutocomplete-endAdornment` holding the clear ×
 * and the chevron. Composing rather than overwriting keeps those indicators
 * mounted, which is what lets UiMultiSelect draw its ring *around* the × — and
 * returning MUI's node untouched when there is no loading slot keeps the
 * rendered tree byte-identical for every control that never opts in.
 */
export function composeEndAdornment(
  loadingAdornment: React.ReactNode,
  own: React.ReactNode
): React.ReactNode {
  if (loadingAdornment == null) {
    return own;
  }
  if (own == null) {
    return loadingAdornment;
  }
  return React.createElement(React.Fragment, null, loadingAdornment, own);
}
