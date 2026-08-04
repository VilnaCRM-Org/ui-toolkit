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

test.describe('Visual states (Figma state grid) — integration card', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The card is consumer-fluid, and every story renders the Figma master's
  // 312x142 inside the consumer's own radiogroup, so this grid gets a narrow
  // frame — wide enough for the card, short enough to keep the diff tight.
  test.use({ viewport: { width: 420, height: 200 } });

  const REST_ID: string = 'uicomponents-uiintegrationcard--integration-card';
  const SELECTED_ID: string = 'uicomponents-uiintegrationcard--selected';

  test('integration card rest', async ({ page }) => {
    await openStory(page, REST_ID);
    // The unchecked baseline the three state shots below are read against: brand-gray
    // border, no shadow, and the 1px grey glyph stroke.
    await shoot(page, 'integration-card-rest.png');
  });

  test('integration card hover', async ({ page }) => {
    await openStory(page, REST_ID);
    // Real `:hover` on the wired card: the border steps brandGray → grey400 and the
    // Figma "Landing shadow" appears — the recipe the component scopes to
    // `:hover:not([aria-disabled="true"]):not([aria-checked="true"])`, which no
    // static tile can prove actually fires.
    await page.getByRole('radio').hover();
    await shoot(page, 'integration-card-hover.png');
  });

  test('integration card selected', async ({ page }) => {
    await openStory(page, SELECTED_ID);
    // The state is programmatic first (a11y contract §1.1): assert `aria-checked`
    // before locking the chrome it is supposed to be painting.
    await expect(page.getByRole('radio')).toBeChecked();
    await shoot(page, 'integration-card-selected.png');
  });

  test('integration card selected hover', async ({ page }) => {
    await openStory(page, SELECTED_ID);
    await expect(page.getByRole('radio')).toBeChecked();
    // a11y contract §7.4 — selected DOMINATES hover: the hover recipe keeps a
    // `:not([aria-checked="true"])` gate, so this shot must be pixel-identical to
    // the selected one above. It exists precisely because §7.4 is the one ruling
    // with no Figma master behind it, so only a regression can hold it.
    await page.getByRole('radio').hover();
    await shoot(page, 'integration-card-selected-hover.png');
  });

  test('integration card focus-visible', async ({ page }) => {
    await openStory(page, REST_ID);
    // Keyboard focus draws the SINGLE-layer inset ring (§7.1): the card paints its
    // own white fill, so a second white layer buys nothing, and inset keeps the ring
    // inside the 12px radius when a consumer clips the card. Tab, never a
    // programmatic `.focus()` — the latter paints no `:focus-visible` ring at all.
    await page.keyboard.press('Tab');
    await shoot(page, 'integration-card-focus.png');
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

test.describe('Visual states (Figma state grid) — filter chip', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The chip hugs its contents at 256x30, so this grid gets the tightest frame on
  // the board — wide enough for the sample string, short enough to keep the diff
  // honest about a 1px border that must never move the children.
  test.use({ viewport: { width: 360, height: 120 } });

  const STORY_ID: string = 'uicomponents-uifilterchip--filter-chip';

  test('filter chip rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The baseline the shots below are read against: grey500 pill, a TRANSPARENT
    // 1px border (present at rest precisely so hover cannot reflow it), grey glyph.
    await shoot(page, 'filter-chip-rest.png');
  });

  test('filter chip hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover` on the wired chip: white fill, grey400 stroke, the chip drop
    // shadow and a brand-blue ×. The recipe is scoped to
    // `:hover:not([aria-disabled="true"])`, which no static tile can prove fires.
    await page.getByRole('button').hover();
    await shoot(page, 'filter-chip-hover.png');
  });

  test('filter chip active', async ({ page }) => {
    await openStory(page, STORY_ID);
    // "Active" is the PRESSED state (A2), not an applied-filter variant: hover plus
    // one darker step on the border and the glyph. Only a real pointer press paints
    // it, so the mouse is held down across the shot.
    await page.getByRole('button').hover();
    await page.mouse.down();
    await shoot(page, 'filter-chip-active.png');
    await page.mouse.up();
  });

  test('filter chip disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // The `aria-disabled` boundary is programmatic first: assert the attribute
    // before locking the chrome it is supposed to be suppressing.
    await expect(page.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'filter-chip-disabled.png');
  });

  test('filter chip focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Figma specifies no focus ring at all, so the Amendment-A1 single-layer inset
    // ring ships IN ADDITION to the state chrome. Tab, never a programmatic
    // `.focus()` — the latter paints no `:focus-visible` ring (the 3.3 gotcha).
    await page.keyboard.press('Tab');
    await shoot(page, 'filter-chip-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — pin input', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // Six 64px cells on the ruled 12px gap span 444px, plus room for the helper text
  // the error shot renders below the group.
  test.use({ viewport: { width: 520, height: 200 } });

  const STORY_ID: string = 'uicomponents-uipininput--pin-input';

  function firstCell(page: Page): Locator {
    return page.getByRole('textbox').first();
  }

  test('pin input rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The baseline: a constant 1px brandGray border on every cell and the grey "0"
    // placeholder the master paints in all four states.
    await shoot(page, 'pin-input-rest.png');
  });

  test('pin input hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover` on one cell: the constant border steps brandGray → grey400 and
    // nothing else moves — the no-jitter law, provable only under a real pointer.
    await firstCell(page).hover();
    await shoot(page, 'pin-input-hover.png');
  });

  test('pin input focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Figma's "Active" column IS the focused cell, so this one shot carries both
    // channels at once: the Figma drop shadow AND the Amendment-A1 inset ring, which
    // ships because a text caret alone is not a 3:1 focus indicator. Real keyboard
    // focus only — a programmatic `.focus()` paints no `:focus-visible`.
    await page.keyboard.press('Tab');
    await shoot(page, 'pin-input-focus.png');
  });

  test('pin input disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // Ruling 3: `readOnly` + `aria-disabled`, never native `disabled`, so the cells
    // stay focusable and keyboard focus is never dropped. Assert the boundary before
    // locking the grey500 fill it drives.
    await expect(firstCell(page)).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'pin-input-disabled.png');
  });

  test('pin input error', async ({ page }) => {
    await openStory(page, STORY_ID, 'error:!true');
    // `aria-invalid` lands on EVERY cell — a user who tabs into cell 4 must still
    // hear the field is wrong — and the helper text below is the non-colour channel
    // that keeps the error from travelling as colour alone.
    await expect(firstCell(page)).toHaveAttribute('aria-invalid', 'true');
    await shoot(page, 'pin-input-error.png');
  });
});

test.describe('Visual states (Figma state grid) — payment option card', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The card is consumer-fluid and every story renders the master's 279x90 inside
  // the consumer's own radiogroup, so this grid gets a narrow frame.
  test.use({ viewport: { width: 380, height: 180 } });

  const STORY_ID: string = 'uicomponents-uipaymentoptioncard--payment-option-card';
  const SELECTED_ARGS: string = 'selected:!true';

  test('payment card rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The unchecked baseline: the border is the same colour as the fill (it carries
    // no information at rest) and the circle is a 1px grey400 stroke.
    await shoot(page, 'payment-card-rest.png');
  });

  test('payment card hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover`: white fill, primary stroke and a primary circle — scoped to
    // `:hover:not([aria-disabled="true"]):not([aria-checked="true"])`.
    await page.getByRole('radio').hover();
    await shoot(page, 'payment-card-hover.png');
  });

  test('payment card selected', async ({ page }) => {
    await openStory(page, STORY_ID, SELECTED_ARGS);
    // The state is programmatic first (a11y contract §1.1): assert `aria-checked`
    // before locking the chrome it is supposed to be painting. The checked circle's
    // distinction is border WIDTH (1px → 5px), not colour, so it survives
    // forced-colors mode.
    await expect(page.getByRole('radio')).toBeChecked();
    await shoot(page, 'payment-card-selected.png');
  });

  test('payment card selected hover', async ({ page }) => {
    await openStory(page, STORY_ID, SELECTED_ARGS);
    await expect(page.getByRole('radio')).toBeChecked();
    // Selected DOMINATES hover: the hover recipe keeps its own
    // `:not([aria-checked="true"])` gate, so this shot must be pixel-identical to
    // the selected one above. No hover-on-selected master exists, which is exactly
    // why only a regression baseline can hold the rule.
    await page.getByRole('radio').hover();
    await shoot(page, 'payment-card-selected-hover.png');
  });

  test('payment card disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // The `aria-disabled` boundary: still a real, focusable button. The grey
    // wordmark is an ASSET swap, not `grayscale(1)` — the filter misses Figma's flat
    // #D0D4D8 badly — and the circle becomes a solid brandGray disc.
    await expect(page.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'payment-card-disabled.png');
  });

  test('payment card focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The single-layer inset ring paints just inside the constant 1px border, so a
    // focused card shows state and focus at once — orthogonal channels, neither
    // substituting for the other. Real Tab only (the 3.3 gotcha).
    await page.keyboard.press('Tab');
    await shoot(page, 'payment-card-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — action icon bar', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The measured Figma row span is 193px (x 56 → 249); the frame adds room for the
  // trash lane's 40x40 pressed plate, which overflows its 24px slot by design.
  test.use({ viewport: { width: 300, height: 120 } });

  const STORY_ID: string = 'uicomponents-uiactioniconbar--action-icon-bar';

  test('icon bar rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The baseline for all six lanes at once: four neutral glyphs in grey300, the
    // eye in grey300 and the trash in error — no chrome, no backdrop, no borders.
    await shoot(page, 'icon-bar-rest.png');
  });

  test('icon bar hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover` on the trash lane — the one lane whose hover ink is
    // strokeDanger rather than primary. Only a pointer can prove the lane ramp is
    // wired to the right glyph.
    await page.getByRole('button', { name: 'Видалити' }).hover();
    await shoot(page, 'icon-bar-hover.png');
  });

  test('icon bar active', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The pressed trash: the only authored button chrome anywhere on Board A (Frame
    // 5441, a 40x40 error@10% plate). It is an absolutely-positioned layer, so the
    // 24px slot rhythm must NOT reflow around it.
    await page.getByRole('button', { name: 'Видалити' }).hover();
    await page.mouse.down();
    await shoot(page, 'icon-bar-active.png');
    await page.mouse.up();
  });

  test('icon bar eye pressed', async ({ page }) => {
    // `pressed` is per-action (inside `actions`), not a top-level arg, so a URL
    // arg cannot flip it — the dedicated EyePressed story bakes PRESSED_ACTIONS.
    await openStory(page, 'uicomponents-uiactioniconbar--eye-pressed');
    // The toggle's state is programmatic first: assert `aria-pressed` before locking
    // the eye-off glyph swap, which is VISUAL ONLY (the glyph is `aria-hidden` in
    // both states, and the label stays constant so nothing double-signals).
    const eye: Locator = page.getByRole('button', { name: 'Видимість' });
    await expect(eye).toHaveAttribute('aria-pressed', 'true');
    await shoot(page, 'icon-bar-eye-pressed.png');
  });

  test('icon bar disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // One disabled ink for all three lanes, danger included — the Figma disabled
    // column is grey400 everywhere. The buttons stay focusable and in tab order.
    await expect(page.getByRole('button').first()).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'icon-bar-disabled.png');
  });

  test('icon bar focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Every action is an INDEPENDENT tab stop: the bar is `role="group"`, not
    // `role="toolbar"`, so there is no roving tabindex and one Tab lands on the
    // first action. Real keyboard only (the 3.3 gotcha).
    await page.keyboard.press('Tab');
    await shoot(page, 'icon-bar-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — status badge', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // A bare 26x26 check-circle; the frame only needs room for the ring.
  test.use({ viewport: { width: 160, height: 100 } });

  const STORY_ID: string = 'uicomponents-uistatusbadge--status-badge';
  const ACTIVE_ARGS: string = 'active:!true';

  test('status badge rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // "Not done": a white disc with a pale outline and a pale check. Every delta
    // from here is COLOUR-ONLY — the 2px border is emitted in every state precisely
    // so nothing moves.
    await shoot(page, 'status-badge-rest.png');
  });

  test('status badge hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover`: the success outline over a 10% success wash. The recipe is
    // gated on `:not([aria-pressed="true"])` too, because hover is an INTERMEDIATE
    // tint and letting it win on an active badge would visually demote it mid-flow.
    await page.getByRole('button').hover();
    await shoot(page, 'status-badge-hover.png');
  });

  test('status badge active', async ({ page }) => {
    await openStory(page, STORY_ID, ACTIVE_ARGS);
    // `aria-pressed` is the state channel — never `role="switch"`, never
    // `aria-checked` — so assert it before locking the solid success disc.
    await expect(page.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    await shoot(page, 'status-badge-active.png');
  });

  test('status badge active hover', async ({ page }) => {
    await openStory(page, STORY_ID, ACTIVE_ARGS);
    await expect(page.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    // The precedence rule: hover keeps its own `:not([aria-pressed="true"])` gate,
    // so this shot must be pixel-identical to the active one above.
    await page.getByRole('button').hover();
    await shoot(page, 'status-badge-active-hover.png');
  });

  test('status badge disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // Disabled derives from ACTIVE, not from rest — a solid fill with a white check,
    // desaturated to brandGray — so the badge reads "done and frozen", never
    // "empty". The button stays focusable behind the `aria-disabled` boundary.
    await expect(page.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'status-badge-disabled.png');
  });

  test('status badge focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The inset ring stays inside the circle, where an outset one would ring a
    // square. Real Tab only (the 3.3 gotcha).
    await page.keyboard.press('Tab');
    await shoot(page, 'status-badge-focus.png');
  });
});

test.describe('Visual states (Figma state grid) — notification badge', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'pixel baselines are generated for chromium only'
  );

  // The counter chip overhangs the 48px circle by 4px and gains another 2px of ring
  // when active, so every shot below is a ROOT screenshot (never an element one):
  // an element shot clips to the button's border box and would cut the ring away —
  // the 3.3 absolute-overhang gotcha.
  test.use({ viewport: { width: 180, height: 120 } });

  const STORY_ID: string = 'uicomponents-uinotificationbadge--notification-badge';

  test('notification badge rest', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The baseline: a near-white disc with the only visible border in the ramp, a
    // grey bell, and the primary counter chip hanging past the right edge.
    await shoot(page, 'notification-badge-rest.png');
  });

  test('notification badge hover', async ({ page }) => {
    await openStory(page, STORY_ID);
    // Real `:hover`: a 10% primary wash with the border dropped to TRANSPARENT
    // rather than removed, so the box model never changes under the pointer.
    await page.getByRole('button').hover();
    await shoot(page, 'notification-badge-hover.png');
  });

  test('notification badge active', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The pressed rendering: a solid primary disc, a white bell, and the chip's 2px
    // OUTSIDE ring — a spread box-shadow, because a CSS border would be drawn inside
    // the 18px chip and shrink it.
    await page.getByRole('button').hover();
    await page.mouse.down();
    await shoot(page, 'notification-badge-active.png');
    await page.mouse.up();
  });

  test('notification badge capped count', async ({ page }) => {
    await openStory(page, STORY_ID, 'count:42');
    // Above `max` the chip AND the accessible name both read "9+": a name saying
    // "42" over a chip reading "9+" is a speech-input failure (SC 2.5.3), so the
    // name is asserted against the DISPLAY string before the chip is locked.
    await expect(page.getByRole('button')).toHaveAccessibleName(/9\+$/);
    await shoot(page, 'notification-badge-capped.png');
  });

  test('notification badge disabled', async ({ page }) => {
    await openStory(page, STORY_ID, 'disabled:!true');
    // Figma ships a disabled column, so it is painted as well as exposed: a
    // brandGray disc, a grey400 bell and a grey400 chip, behind a boundary that
    // keeps the button real and focusable.
    await expect(page.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    await shoot(page, 'notification-badge-disabled.png');
  });

  test('notification badge focus-visible', async ({ page }) => {
    await openStory(page, STORY_ID);
    // The TWO-layer inset ring (dark over white): the rest, hover and active fills
    // differ sharply, so the white separator is what keeps the dark ring legible on
    // all three. Real Tab only (the 3.3 gotcha).
    await page.keyboard.press('Tab');
    await shoot(page, 'notification-badge-focus.png');
  });
});
