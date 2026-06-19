import { test, expect, type Page, type Locator } from '@playwright/test';

// Enforces the Figma "state grid" (Rest / Hover / Active / Disabled / Error /
// Focus) for the interactive components. The design board lays each component
// out per state; the base visual.spec only captures the rest state, so these
// tight per-state baselines lock in the rest of the spec. Chromium-only, like
// the rest of the visual suite.

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

async function openStory(page: Page, id: string, args?: string): Promise<void> {
  const argPart: string = args ? `&args=${args}` : '';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/iframe.html?id=${id}&viewMode=story${argPart}`);
  await page.locator('#storybook-root, #root').first().waitFor({ state: 'visible' });
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(() => document.fonts.ready);
}

function root(page: Page): Locator {
  return page.locator('#storybook-root, #root').first();
}

async function shoot(page: Page, name: string): Promise<void> {
  await expect(root(page)).toHaveScreenshot(name, { maxDiffPixelRatio: 0.02 });
}

test.describe('Visual states (Figma state grid)', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  test.use({ viewport: { width: 520, height: 260 } });

  for (const variant of ['contained', 'outlined'] as const) {
    const id: string = `uicomponents-uibutton--${variant}`;

    test(`button ${variant} hover`, async ({ page }) => {
      await openStory(page, id);
      await page.getByRole('button').hover();
      await shoot(page, `button-${variant}-hover.png`);
    });

    test(`button ${variant} active`, async ({ page }) => {
      await openStory(page, id);
      await page.getByRole('button').hover();
      await page.mouse.down();
      await shoot(page, `button-${variant}-active.png`);
      await page.mouse.up();
    });

    test(`button ${variant} focus-visible`, async ({ page }) => {
      await openStory(page, id);
      await page.keyboard.press('Tab');
      await shoot(page, `button-${variant}-focus.png`);
    });

    test(`button ${variant} disabled`, async ({ page }) => {
      await openStory(page, id, 'disabled:!true');
      await shoot(page, `button-${variant}-disabled.png`);
    });
  }

  test('input focus-visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uiinput--input');
    await page.keyboard.press('Tab');
    await shoot(page, 'input-focus.png');
  });

  test('input error', async ({ page }) => {
    await openStory(page, 'uicomponents-uiinput--input', 'error:!true');
    await shoot(page, 'input-error.png');
  });

  test('input disabled', async ({ page }) => {
    await openStory(page, 'uicomponents-uiinput--input', 'disabled:!true');
    await shoot(page, 'input-disabled.png');
  });

  test('checkbox checked', async ({ page }) => {
    await openStory(page, 'uicomponents-uicheckbox--checkbox', 'checked:!true');
    await expect(page.getByRole('checkbox')).toBeChecked();
    await shoot(page, 'checkbox-checked.png');
  });

  test('checkbox error', async ({ page }) => {
    await openStory(page, 'uicomponents-uicheckbox--checkbox', 'error:!true');
    await shoot(page, 'checkbox-error.png');
  });

  test('checkbox disabled', async ({ page }) => {
    await openStory(page, 'uicomponents-uicheckbox--checkbox', 'disabled:!true');
    await shoot(page, 'checkbox-disabled.png');
  });

  test('link hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await page.getByRole('link').hover();
    await shoot(page, 'link-hover.png');
  });

  test('link focus-visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await page.keyboard.press('Tab');
    await shoot(page, 'link-focus.png');
  });
});
