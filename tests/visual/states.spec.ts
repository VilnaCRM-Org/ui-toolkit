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
  await expect(root(page)).toHaveScreenshot(name);
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

  test('input hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uiinput--input');
    await page.getByRole('textbox').hover();
    await shoot(page, 'input-hover.png');
  });

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

  test('checkbox hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uicheckbox--checkbox');
    await page.getByRole('checkbox').hover();
    await shoot(page, 'checkbox-hover.png');
  });

  test('radio error', async ({ page }) => {
    await openStory(page, 'uicomponents-uiradiogroup--radio-group', 'error:!true');
    await shoot(page, 'radio-error.png');
  });

  test('radio disabled', async ({ page }) => {
    await openStory(page, 'uicomponents-uiradiogroup--radio-group', 'disabled:!true');
    await shoot(page, 'radio-disabled.png');
  });

  test('radio hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uiradiogroup--radio-group');
    // Hover an unselected radio so the hover affordance (primary border) shows.
    await page.getByRole('radio', { name: 'SMS' }).hover();
    await shoot(page, 'radio-hover.png');
  });

  test('file upload disabled', async ({ page }) => {
    await openStory(page, 'uicomponents-uifileuploadinput--file-upload-input', 'disabled:!true');
    await shoot(page, 'file-upload-disabled.png');
  });

  test('file upload pill hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uifileuploadinput--file-upload-input');
    await page.getByText('Загрузити').hover();
    await shoot(page, 'file-upload-hover.png');
  });

  test('link hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await page.getByRole('link').hover();
    await shoot(page, 'link-hover.png');
  });

  test('link active', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await page.getByRole('link').hover();
    await page.mouse.down();
    await shoot(page, 'link-active.png');
    await page.mouse.up();
  });

  test('link focus-visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uilink--link');
    await page.keyboard.press('Tab');
    await shoot(page, 'link-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — pagination', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The composed bar is 685px wide, so the pagination grid gets its own, wider
  // viewport instead of the 520px shared by the smaller controls above.
  test.use({ viewport: { width: 800, height: 200 } });

  test('pagination cell hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uipagination--pagination');
    // Hover a rest cell (page 3; the story starts on page 2) so the Primary@10%
    // hover fill and Primary ink show against the neighbouring rest/current cells.
    await page.getByRole('button', { name: 'Сторінка 3' }).hover();
    await shoot(page, 'pagination-cell-hover.png');
  });

  test('pagination link hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uipagination--pagination');
    // Hover the next link: label and chevron tint to the theme hover blue together.
    await page.getByRole('button', { name: 'Наступна' }).hover();
    await shoot(page, 'pagination-link-hover.png');
  });
});

test.describe('Visual states (Figma state grid) — item row', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The row stretches to its container width, so this grid gets a wide viewport;
  // one row plus its inset focus ring fits comfortably in the shorter height.
  test.use({ viewport: { width: 760, height: 140 } });

  test('item row hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uiitemrow--item-row');
    // Real `:hover` on the wired row: the accent border darkens and the per-method
    // row shadow appears — proving the theme's scoped hover recipe actually fires.
    await page.getByRole('button').hover();
    await shoot(page, 'item-row-hover.png');
  });

  test('item row focus-visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uiitemrow--item-row');
    // Keyboard focus draws the inset ring, which the overflow:hidden radius must not
    // clip (a11y contract §3.5) — a state no static tile can capture.
    await page.keyboard.press('Tab');
    await shoot(page, 'item-row-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — task card', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The card is consumer-fluid (the Figma master is 372px), and 94px tall at the
  // two-line title, so this grid gets a narrow viewport and a short frame.
  test.use({ viewport: { width: 520, height: 160 } });

  test('task card hover', async ({ page }) => {
    await openStory(page, 'uicomponents-uitaskcard--task-card');
    // Real `:hover` on the wired card: title and label ink darken and the deadline
    // chip turns white with its stroke and shadow — the recipe the theme scopes to
    // `:hover:not([aria-disabled="true"])`, which no static tile can prove fires.
    await page.getByRole('button').hover();
    await shoot(page, 'task-card-hover.png');
  });

  test('task card focus-visible', async ({ page }) => {
    await openStory(page, 'uicomponents-uitaskcard--task-card');
    // Keyboard focus draws the two-layer INSET ring (dark over white); it is inset
    // precisely because a board column would clip an outset one.
    await page.keyboard.press('Tab');
    await shoot(page, 'task-card-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — profile select card', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The card is fluid, but every story renders it at the Figma master's 225px, and
  // the open stack is 195px tall (48px trigger + 11px gap + 136px menu), so this
  // grid gets a narrow viewport tall enough to hold the whole popup.
  test.use({ viewport: { width: 320, height: 260 } });

  const STORY_ID: string = 'uicomponents-uiprofileselectcard--profile-select-card';

  // Opening with the KEYBOARD is deliberate, not incidental. The menu's focus move
  // is a bare `element.focus()` (a11y contract §4.2), and per the HTML `focus()`
  // steps a programmatic focus only inherits the focus-visible flag when the
  // currently focused area already carries it. A pointer open therefore paints no
  // ring — correct, since a mouse user asked for no indicator — so the keyboard
  // path is the only one that renders the indicator these baselines exist to lock.
  async function openMenuByKeyboard(page: Page): Promise<void> {
    await openStory(page, STORY_ID);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    // §4.2 again: focus ALWAYS enters the menu on the closed→open transition and
    // lands on the FIRST row, so the ring below is on a menuitem, never the trigger.
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  }

  test('profile card hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover` on the wired trigger: the border steps grey400 → grey300 and the
    // Figma "Landing shadow" appears — the recipe the theme scopes to
    // `:hover:not([aria-disabled="true"]):not([aria-expanded="true"])`, which no
    // static tile can prove actually fires.
    await page.getByRole('button').hover();
    await shoot(page, 'profile-card-hover.png');
  });

  test('profile card focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Keyboard focus draws the SINGLE-layer inset ring (a11y contract §7.1): the card
    // paints its own white fill, so the task card's second white layer is redundant,
    // and inset keeps the ring inside the 8px radius when a consumer clips the card.
    await page.keyboard.press('Tab');
    await shoot(page, 'profile-card-focus.png');
  });

  // The two open-menu shots capture the VIEWPORT, not the story root: the popup is
  // absolutely positioned (a11y contract §2.4), so it never extends the root's
  // 48px border box and a root-element screenshot would clip the entire menu away.
  test('profile menu item focus', async ({ page }) => {
    await openMenuByKeyboard(page);
    // The same ring on the white menu row — a state no static tile can capture,
    // because it only exists while the popup is mounted and holding focus.
    await expect(page).toHaveScreenshot('profile-menu-item-focus.png');
  });

  test('profile menu item focus on hover fill', async ({ page }) => {
    await openMenuByKeyboard(page);
    // a11y contract §7.2: the `#F4F5F6` row hover fill is decoration and is NEVER the
    // focus indicator. Hovering the row that already holds focus is the one state
    // where the two collide, and the ring must stay legible on top of the fill —
    // which is why `:focus-visible` is declared after `:hover` in `menuItemSx`.
    await page.getByRole('menuitem').first().hover();
    await expect(page).toHaveScreenshot('profile-menu-item-focus-hover.png');
  });
});
