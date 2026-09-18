# Accessibility acceptance standard

## Conformance target

Every component and every Storybook story in `@vilnacrm/ui-toolkit` conforms to
**WCAG 2.1 Level AA**. The target is enforced, not aspirational: `make test-a11y` (workflow
`accessibility testing`) blocks a pull request on any violation, alongside the `jsx-a11y` lint
rules and the Lighthouse per-rule audits that already run.

## In-scope rule set

Both axe-core layers run the same tag set, declared once in `tests/a11y/axe-config.ts`
(`WCAG_AA_TAGS`) and imported everywhere: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
`best-practice`. No test re-declares the list.

| Layer     | Runner                 | Scope                                                       |
| --------- | ---------------------- | ----------------------------------------------------------- |
| Component | `jest-axe` (jsdom)     | Rendered via `renderWithProviders` inside the real theme    |
| Story     | `@axe-core/playwright` | Every story iframe in `tests/visual/stories.json`, chromium |

Interaction stories (`tests/storybook/interaction-stories.json`) autoplay their `play` function
on render, so a scan would hit an undefined mid-play frame. They are skipped by the story scan,
proven behaviourally by `make test-storybook`, and the scan asserts the skip list equals that
registry so no story can drop out of both.

## Definition of a11y-done

A component or story is done when it passes both layers and, in addition:

- every control exposes an accessible name that contains its visible label;
- every form field is programmatically labelled and its error/description is associated via
  `aria-describedby`, with `aria-invalid` on error;
- ARIA roles, states and properties match the pattern the control implements;
- every control is keyboard operable in DOM order, Enter/Space activate it, and focus is visible
  (`tests/a11y/keyboard-focus.spec.ts` asserts this on the core controls);
- images and icons carry an alternative or are hidden as decorative.

## Documented carve-outs

Two rule groups are disabled in `tests/a11y/axe-config.ts`. They are design decisions, not
per-component defects, and they are not entries in the exception allowlist.

1. **Brand palette: `color-contrast`** (`BRAND_DISABLED_RULES`). The Figma brand palette
   (white on `#1EAEFF`, about 2.45:1) is faithful to the design; raising contrast would change the
   brand. `lighthouserc.js` records the same decision as `'color-contrast': 'warn'` in its
   assertion matrix, so both gates agree. Contrast is reported, never blocking.
2. **Component isolation: `region`, `landmark-one-main`, `page-has-heading-one`**
   (`COMPONENT_ISOLATION_RULES`). An isolated component render or a story iframe has no page
   composition by construction: no `<main>`, no `<h1>`, no landmark wrapping its content. Those
   are the consuming application's responsibility. `jest-axe` leaves `region` enabled and every
   isolated render trips it, so the group applies to both layers.

## Exception process

`A11Y_EXCEPTIONS` in `tests/a11y/axe-config.ts` is the only accepted way to carry per-rule debt
and it starts empty. Inline `eslint-disable`, ad-hoc rule removal and `test.skip` are not
accepted. An entry needs every field:

```ts
{
  ruleId: 'nested-interactive',
  selector: '.MuiChip-root',
  reason: 'why the debt is accepted',
  trackingUrl: 'https://github.com/VilnaCRM-Org/ui-toolkit/issues/<n>',
}
```

`withoutAllowedViolations` drops a violation node only when both `ruleId` and `selector` match,
so an exception never widens past the element it names. The reviewer of the pull request confirms
the tracking issue exists, the reason is a design constraint rather than missing work, and the
selector is the narrowest that matches. Remove the entry in the pull request that fixes the debt.
