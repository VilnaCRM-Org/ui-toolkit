const MISSING_NEW_TAB_LABEL_WARNING: string =
  'UiLink received target="_blank" without a `newTabLabel`; the new-tab cue is not ' +
  'announced, so assistive-technology users are not told the link leaves the page. Pass ' +
  "the application's translated label, or an empty string to render no cue.";

export default function newTabLabelWarning(
  opensInNewTab: boolean,
  label: string | null | undefined
): string | null {
  return opensInNewTab && label == null ? MISSING_NEW_TAB_LABEL_WARNING : null;
}
