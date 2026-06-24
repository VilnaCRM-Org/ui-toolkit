import { test, expect } from '@playwright/test';

import { gotoStory } from './utils';

test.describe('AuthSkeleton loading region', () => {
  test('exposes the default loading region landmark', async ({ page }) => {
    await gotoStory(page, 'uicomponents-authskeleton--animated');

    await expect(page.getByRole('region', { name: 'Loading form' })).toBeVisible();
  });

  test('honours a custom aria label', async ({ page }) => {
    await gotoStory(page, 'uicomponents-authskeleton--custom-aria-label');

    await expect(page.getByRole('region', { name: 'Loading sign-up form' })).toBeVisible();
  });

  test('freezes the shimmer animation under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoStory(page, 'uicomponents-authskeleton--animated');

    await expect(page.getByRole('region', { name: 'Loading form' })).toBeVisible();
    // The reduced-motion guard on baseSkeletonStyle must collapse the shimmer.
    await expect(page.locator('#auth-skeleton-title')).toHaveCSS('animation-name', 'none');
  });
});
