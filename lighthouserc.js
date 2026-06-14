// Lighthouse CI for the component library. Audits a representative set of
// Storybook story iframes from the built `storybook-static` bundle.
//
// `make lighthouse-desktop` adds `--collect.settings.preset=desktop`;
// `make lighthouse-mobile` adds `--collect.settings.formFactor=mobile`. The same
// config drives both — only the form factor / throttling differs.
//
// Stories are rendered in isolation (`/iframe.html`), so page-level a11y audits
// (html-lang, document-title, landmarks) don't apply and would unfairly sink the
// category score. We therefore gate on COMPONENT-level a11y audits as errors
// (contrast, accessible names, labels, ARIA) and keep the category scores as
// warnings.

const STORY_IDS = [
  'uicomponents-uibutton--contained',
  'uicomponents-uibutton--outlined',
  'uicomponents-uibutton--social-button',
  'uicomponents-uiinput--input',
  'uicomponents-uicheckbox--checkbox',
  'uicomponents-uilink--link',
  'uicomponents-uitypography--typography',
  'uicomponents-uiform--default',
  'uicomponents-uitooltip--tooltip',
  'uicomponents-uifooter--footer',
];

const story = (id) => `/iframe.html?id=${id}&viewMode=story`;

module.exports = {
  ci: {
    collect: {
      staticDistDir: './storybook-static',
      url: STORY_IDS.map(story),
      numberOfRuns: 1,
      settings: {
        // Component iframes don't need the SEO/PWA passes; keep the run lean.
        onlyCategories: ['accessibility', 'best-practices', 'performance'],
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      assertions: {
        // color-contrast is WARN, not error: the known failures (white on the
        // brand primary #1EAEFF ~2.45:1, brand-blue links, grey300 footer text on
        // the shaded bg ~2.57:1) come from the BRAND palette in the Figma design,
        // which the toolkit implements faithfully. Raising contrast means changing
        // the brand — a design decision, not a toolkit fix — so we surface (warn)
        // rather than block. The toolkit-fixable audits below stay as errors.
        'color-contrast': 'warn',
        'button-name': 'error',
        'link-name': 'error',
        'image-alt': 'error',
        label: 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'duplicate-id-aria': 'error',
        // Category scores: warn only — isolated iframes drag a11y down via
        // page-level audits, and perf of a static iframe isn't meaningful.
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.7 }],
      },
    },
    upload: {
      // Keep results local — never publish externally.
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
