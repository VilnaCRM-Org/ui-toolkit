// When a field dropdown is force-opened for a static demo, pin it below the field
// (no viewport flip) so showcase/state tiles render predictably. Shared by the
// search / select-with-search / multi-select field controls.
export const OPEN_FIELD_POPPER = {
  placement: 'bottom-start' as const,
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'preventOverflow', enabled: false },
  ],
};
