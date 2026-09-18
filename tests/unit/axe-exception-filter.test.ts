import {
  A11Y_EXCEPTIONS,
  BRAND_DISABLED_RULES,
  COMPONENT_ISOLATION_RULES,
  DISABLED_RULES,
  WCAG_AA_TAGS,
  axeRunOptions,
  withoutAllowedViolations,
  type A11yException,
  type ViolationLike,
} from '../a11y/axe-config';

const chipException: A11yException = {
  ruleId: 'nested-interactive',
  selector: '.MuiChip-root',
  reason: 'tracked',
  trackingUrl: 'https://example.com/issues/1',
};

const violation = (id: string, ...targets: string[]): ViolationLike => ({
  id,
  nodes: targets.map(target => ({ target: [target] })),
});

describe('axe shared config', () => {
  it('starts with an empty exception allowlist', () => {
    expect(A11Y_EXCEPTIONS).toEqual([]);
  });

  it('disables only the brand carve-out and the component-isolation rules', () => {
    expect(BRAND_DISABLED_RULES).toEqual(['color-contrast']);
    expect(COMPONENT_ISOLATION_RULES).toEqual([
      'region',
      'landmark-one-main',
      'page-has-heading-one',
    ]);
    expect(DISABLED_RULES).toEqual([...BRAND_DISABLED_RULES, ...COMPONENT_ISOLATION_RULES]);
  });

  it('builds run options from the WCAG tag list and the disabled rules', () => {
    expect(axeRunOptions()).toEqual({
      runOnly: { type: 'tag', values: [...WCAG_AA_TAGS] },
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
        'landmark-one-main': { enabled: false },
        'page-has-heading-one': { enabled: false },
      },
    });
    expect(axeRunOptions(['label']).rules).toEqual({ label: { enabled: false } });
  });
});

describe('withoutAllowedViolations', () => {
  it('passes every violation through the default (empty) allowlist', () => {
    const violations = [violation('button-name', 'button'), violation('label', 'input')];
    expect(withoutAllowedViolations(violations)).toEqual(violations);
  });

  it('drops only the node whose rule and selector both match an exception', () => {
    const filtered = withoutAllowedViolations(
      [
        violation('nested-interactive', '.MuiChip-root', '.other'),
        violation('nested-interactive', '.MuiChip-root'),
      ],
      [chipException]
    );

    expect(filtered).toEqual([violation('nested-interactive', '.other')]);
  });

  it('keeps a rule match whose selector differs from the exception', () => {
    const violations = [violation('nested-interactive', '.other')];

    expect(withoutAllowedViolations(violations, [chipException])).toEqual(violations);
  });

  it('keeps a selector match whose rule differs from the exception', () => {
    const violations = [violation('button-name', '.MuiChip-root')];

    expect(withoutAllowedViolations(violations, [chipException])).toEqual(violations);
  });

  it('keeps a node whose target is not a selector list', () => {
    const violations: ViolationLike[] = [
      { id: 'nested-interactive', nodes: [{ target: '.MuiChip-root' }] },
    ];

    expect(withoutAllowedViolations(violations, [chipException])).toEqual(violations);
  });
});
