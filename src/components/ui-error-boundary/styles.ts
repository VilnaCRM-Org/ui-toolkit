// Literal values only. The failure path must not run anything that can itself
// throw, so there is no theme callback here and no import from the theme module.
export default {
  fallback: {
    // Literal copy of `sharedPalette.error.main` (src/components/ui-color-theme).
    color: '#DC3939',
    margin: 0,
  },
};
