import { test, expect } from '@playwright/test';

import { gotoStory } from './utils';

// The skeleton is decorative: there is no landmark and no accessible name on
// the container. Loading state is carried by `aria-busy` plus visually-hidden
// status text, and every shape sits inside an `aria-hidden` subtree.
test.describe('AuthSkeleton loading state', () => {
  test('marks itself busy and exposes the default hidden loading text', async ({ page }) => {
    await gotoStory(page, 'uicomponents-authskeleton--animated');

    const root = page.locator('[aria-busy="true"]');
    await expect(root).toHaveCount(1);
    await expect(root.getByText('Loading form')).toBeAttached();
    // No landmark: the old aria-labelled <section> must not come back.
    await expect(page.getByRole('region', { name: 'Loading form' })).toHaveCount(0);
    await expect(root).not.toHaveAttribute('aria-label', /.*/);
  });

  test('honours a custom hidden loading text', async ({ page }) => {
    await gotoStory(page, 'uicomponents-authskeleton--custom-aria-label');

    const root = page.locator('[aria-busy="true"]');
    await expect(root.getByText('Loading sign-up form')).toBeAttached();
  });

  test('keeps every skeleton shape out of the accessibility tree', async ({ page }) => {
    await gotoStory(page, 'uicomponents-authskeleton--animated');

    const shapes = page.locator('[aria-busy="true"] > [aria-hidden="true"]');
    await expect(shapes).toHaveCount(1);
    await expect(shapes.locator('[id$="auth-skeleton-title"]')).toBeAttached();
    // Nothing inside the placeholder may take focus.
    const busy: string = '[aria-busy="true"]';
    await expect(
      page.locator(`${busy} a[href], ${busy} button, ${busy} input, ${busy} [tabindex]`)
    ).toHaveCount(0);
  });

  test('freezes the shimmer animation under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoStory(page, 'uicomponents-authskeleton--animated');

    await expect(page.locator('[aria-busy="true"]')).toHaveCount(1);
    // The reduced-motion guard on baseSkeletonStyle must collapse the shimmer.
    // Ids are React.useId()-prefixed, so the locator matches the stable suffix.
    await expect(page.locator('[id$="auth-skeleton-title"]')).toHaveCSS('animation-name', 'none');
  });
});
