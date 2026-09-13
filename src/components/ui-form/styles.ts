import breakpointsTheme from '../ui-breakpoints';
import colorTheme from '../ui-color-theme';

export default {
  // CRM parity: the error banner takes programmatic focus when a submit fails;
  // the ring is the error token so the failure cue and the focus cue read as
  // one. `:focus-visible` is deliberate for a script-focused target: per the
  // Selectors 4 heuristics (implemented by Chromium, Gecko and WebKit) an
  // element focused from script inherits the modality of the element that had
  // focus — so a keyboard-driven submit (Enter on the field or the button)
  // shows the ring, while a pointer-driven one does not need it: the red alert
  // text is already the visible cue, and the ring would only be noise.
  errorBannerFocus: {
    outline: 'none',
    '&:focus-visible': {
      outline: `2px solid ${colorTheme.palette.error.main}`,
      outlineOffset: '2px',
    },
  },
  formTitle: {
    fontSize: '1.375rem',
    fontFamily: 'Golos Text',
    fontWeight: 700,
    letterSpacing: 0,
    lineHeight: '1',
    marginBottom: '0.5rem',
    [`@media (min-width:${breakpointsTheme.breakpoints.values.md}px)`]: {
      marginBottom: '0.9375rem',
      fontWeight: 600,
      fontSize: '1.875rem',
    },
    [`@media (min-width:${breakpointsTheme.breakpoints.values.xl}px)`]: {
      marginBottom: '0.9375rem',
    },
  },
  formSubtitle: {
    fontFamily: 'Golos Text',
    fontWeight: 400,
    fontSize: '0.9375rem',
    lineHeight: '1.67',
    letterSpacing: 0,
    marginBottom: '1.0625rem',
    [`@media (min-width:${breakpointsTheme.breakpoints.values.sm}px)`]: {
      fontSize: '1rem',
      lineHeight: '1.625',
    },
    [`@media (min-width:${breakpointsTheme.breakpoints.values.lg}px)`]: {
      marginBottom: '1.25rem',
    },
  },
  submitButton: {
    width: '100%',
    height: '3.125rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    fontWeight: 500,
    fontStyle: 'normal',
    fontSize: '0.9375rem',
    lineHeight: 1.2,
    letterSpacing: 0,
    textTransform: 'none',
    boxShadow: 'none',
    [`@media (min-width:375px)`]: {
      minWidth: '19.6875rem',
    },
    [`@media (min-width:${breakpointsTheme.breakpoints.values.md}px)`]: {
      minWidth: '33.75rem',
      height: '4.375rem',
      paddingTop: '1.5rem',
      paddingBottom: '1.5rem',
      marginTop: '2.125rem',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1,
    },
    [`@media (min-width:${breakpointsTheme.breakpoints.values.lg}px)`]: {
      minWidth: '26.375rem',
      maxHeight: '4.375rem',
      paddingTop: '1.5rem',
      paddingBottom: '1.5rem',
      marginTop: '2.0625rem',
    },
    [`@media (min-width:${breakpointsTheme.breakpoints.values.xl}px)`]: {
      maxHeight: '3.875rem',
      paddingTop: '1.25rem',
      paddingBottom: '1.25rem',
      marginTop: '1.1875rem',
      fontFamily: 'Golos Text',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1,
    },
  },
};
