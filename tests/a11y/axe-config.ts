export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] as const;

export const BRAND_DISABLED_RULES = ['color-contrast'] as const;

export const COMPONENT_ISOLATION_RULES = [
  'region',
  'landmark-one-main',
  'page-has-heading-one',
] as const;

export interface A11yException {
  ruleId: string;
  selector: string;
  reason: string;
  trackingUrl: string;
}

export const A11Y_EXCEPTIONS: readonly A11yException[] = [];

export const DISABLED_RULES: readonly string[] = [
  ...BRAND_DISABLED_RULES,
  ...COMPONENT_ISOLATION_RULES,
];

export interface AxeRunOptions {
  runOnly: { type: 'tag'; values: string[] };
  rules: Record<string, { enabled: boolean }>;
}

export function axeRunOptions(disabled: readonly string[] = DISABLED_RULES): AxeRunOptions {
  return {
    runOnly: { type: 'tag', values: [...WCAG_AA_TAGS] },
    rules: Object.fromEntries(disabled.map(id => [id, { enabled: false }])),
  };
}

export interface ViolationNodeLike {
  target: unknown;
}

export interface ViolationLike {
  id: string;
  nodes: ViolationNodeLike[];
}

function targetMatches(target: unknown, selector: string): boolean {
  return Array.isArray(target) && target.includes(selector);
}

function isAllowed(
  exceptions: readonly A11yException[],
  ruleId: string,
  node: ViolationNodeLike
): boolean {
  return exceptions.some(
    exception => exception.ruleId === ruleId && targetMatches(node.target, exception.selector)
  );
}

export function withoutAllowedViolations<T extends ViolationLike>(
  violations: readonly T[],
  exceptions: readonly A11yException[] = A11Y_EXCEPTIONS
): T[] {
  return violations
    .map(violation => ({
      ...violation,
      nodes: violation.nodes.filter(node => !isAllowed(exceptions, violation.id, node)),
    }))
    .filter(violation => violation.nodes.length > 0);
}
