import { axe } from 'jest-axe';

import { axeRunOptions, withoutAllowedViolations } from './axe-config';

export default async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const results = await axe(container, axeRunOptions());
  const violations = withoutAllowedViolations(results.violations);
  expect({ ...results, violations }).toHaveNoViolations();
}
