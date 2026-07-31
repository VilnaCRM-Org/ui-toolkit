import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Board } from '../../src/showcase/new-components-board/board';
import {
  AMOCRM_LOGO_SRC,
  HUBSPOT_LOGO_SRC,
  INTEGRATION_CARDS,
  LIQPAY_GREY_LOGO_SRC,
  LIQPAY_LOGO_SRC,
  PAYMENT_OPTIONS,
  WAYFORPAY_LOGO_SRC,
  type IntegrationSample,
  type PaymentSample,
} from '../../src/showcase/new-components-board/fixtures';
import {
  actionIconBarNode,
  notificationBadgeNode,
  statusBadgeNode,
} from '../../src/showcase/new-components-board/micro-badge-nodes';
import {
  filterChipNode,
  paymentOptionCardNode,
  pinInputNode,
} from '../../src/showcase/new-components-board/micro-nodes';
import { searchNode } from '../../src/showcase/new-components-board/nodes';

import mockConsoleWarn from './utils/mock-console-warn';

// The Figma-parity showcase board is a static demonstration surface (its pixel
// contract lives in the visual suite). This unit smoke test renders the whole
// board so every group, tile and state builder is exercised — locking in that the
// decomposed modules compose into a single, crash-free React tree.
mockConsoleWarn();

// Every section heading Figma draws, in board order.
const GROUP_HEADINGS: readonly string[] = [
  'Пошук',
  'Select з пошуком',
  'Multiselect',
  'Radio button',
  'Календар (діапазон дат)',
  'Пагінація',
  'Завантаження файлу',
  'Рядок ендпоінта (REST API)',
  'Картка завдання (Дошка)',
  'Картка профілю (меню)',
  'Картка інтеграції',
  'Чіп фільтра',
  'Поле PIN-коду (2FA)',
  'Картка способу оплати',
  'Панель піктограм дій',
  'Бейдж статусу',
  'Бейдж сповіщень',
];

describe('New Components board (Figma parity showcase)', () => {
  it('renders one section heading per showcase group', () => {
    render(<Board />);

    for (const heading of GROUP_HEADINGS) {
      expect(screen.getByRole('heading', { level: 3, name: heading })).toBeInTheDocument();
    }
  });

  it('renders the endpoint-row tiles as disclosure buttons and plain rows', () => {
    render(<Board />);

    // The expanded tile wires an onToggle, so it renders as a button; the row's
    // path and description are real (separate) text nodes on every tile.
    expect(screen.getAllByText('/put/{petID}/uploadImage').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Uploads an image').length).toBeGreaterThan(0);

    // Only the expanded tile is wired (its onToggle makes it a disclosure button);
    // toggling it exercises the tile's no-op handler.
    const expanded: HTMLElement = screen.getByRole('button', {
      name: 'POST /put/{petID} Update existing pet',
    });
    fireEvent.click(expanded);
    expect(expanded).toHaveAttribute('aria-expanded', 'true');

    // The rest/hover endpoint tiles wire no onToggle, so they render as plain
    // content — never a disclosure button. The GET tiles share this name, and
    // none is wired, so no such button exists.
    expect(
      screen.queryByRole('button', { name: 'GET /put/{petID}/uploadImage Uploads an image' })
    ).not.toBeInTheDocument();
  });

  it('pairs each integration brand with its own mark and intrinsic Figma size', () => {
    const [hubspot, amocrm]: IntegrationSample[] = INTEGRATION_CARDS;

    // The two marks are interchangeable data URIs, so only this pairing stops a
    // silent swap; the sizes are the masters' own (139x40 and 181x52), and the
    // card's vertical placement rule is computed from them.
    expect(hubspot).toEqual({
      name: 'Hubspot',
      logo: { src: HUBSPOT_LOGO_SRC, width: 139, height: 40 },
    });
    expect(amocrm).toEqual({
      name: 'AmoCRM',
      logo: { src: AMOCRM_LOGO_SRC, width: 181, height: 52 },
    });
    expect(HUBSPOT_LOGO_SRC.startsWith('data:image/png;base64,')).toBe(true);
    expect(AMOCRM_LOGO_SRC.startsWith('data:image/png;base64,')).toBe(true);
    expect(HUBSPOT_LOGO_SRC).not.toBe(AMOCRM_LOGO_SRC);
  });

  it('forces the search field responsive/interaction variants without crashing', () => {
    // searchNode drives both branches of every optional (tablet/hover/open/
    // mobilePaper); rendering the full matrix asserts the builder stays total.
    render(
      <>
        {searchNode({})}
        {searchNode({ tablet: true, hover: true })}
        {searchNode({ open: true, mobilePaper: true })}
      </>
    );

    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });

  it('pairs each payment brand with its own marks and intrinsic Figma sizes', () => {
    const [liqpay, wayforpay]: PaymentSample[] = PAYMENT_OPTIONS;

    // The three marks are interchangeable data URIs, so only this pairing stops a
    // silent swap; the sizes are the masters' own (116x24 and 187x67, the 1x of the
    // 2x exports). WayForPay ships no grey master, so it carries no `logoDisabled`
    // and falls back to its colour mark — the component's documented behaviour.
    expect(liqpay).toEqual({
      name: 'LiqPay',
      logo: { src: LIQPAY_LOGO_SRC, width: 116, height: 24 },
      logoDisabled: { src: LIQPAY_GREY_LOGO_SRC, width: 116, height: 24 },
    });
    expect(wayforpay).toEqual({
      name: 'WayForPay',
      logo: { src: WAYFORPAY_LOGO_SRC, width: 187, height: 67 },
    });
    expect(LIQPAY_LOGO_SRC.startsWith('data:image/png;base64,')).toBe(true);
    expect(LIQPAY_GREY_LOGO_SRC.startsWith('data:image/png;base64,')).toBe(true);
    expect(WAYFORPAY_LOGO_SRC.startsWith('data:image/png;base64,')).toBe(true);
    // The grey mark is a separate ASSET, never a CSS filter over the colour one.
    expect(LIQPAY_LOGO_SRC).not.toBe(LIQPAY_GREY_LOGO_SRC);
    expect(LIQPAY_LOGO_SRC).not.toBe(WAYFORPAY_LOGO_SRC);
    expect(LIQPAY_GREY_LOGO_SRC).not.toBe(WAYFORPAY_LOGO_SRC);
  });

  it('forces the chip, PIN and payment-card variants without crashing', () => {
    // Each builder drives both branches of every optional; rendering the full
    // matrix asserts they stay total. The wired chip is one remove button, the
    // static one is plain content, and the wired card wears the board's own
    // consumer `role="radiogroup"`.
    const [liqpay]: PaymentSample[] = PAYMENT_OPTIONS;
    render(
      <>
        {filterChipNode({ hover: true, active: true, focus: true })}
        {filterChipNode({ disabled: true, staticChip: true })}
        {pinInputNode({ hover: true, focus: true, length: 2, value: '7' })}
        {pinInputNode({ disabled: true, error: true })}
        {paymentOptionCardNode({ option: liqpay, hover: true, selected: true })}
        {paymentOptionCardNode({ option: liqpay, disabled: true, staticCard: true })}
      </>
    );

    // The wired chip is ONE remove button spanning the whole pill, and its name
    // ends in the visually-hidden removal suffix; activating it exercises the
    // tile's own no-op, which is the only callback these static tiles carry.
    const removeSuffix = /видалити фільтр$/;
    const chip: HTMLElement = screen.getByRole('button', { name: removeSuffix });
    fireEvent.click(chip);
    expect(chip).toBeInTheDocument();
    expect(screen.getAllByRole('radiogroup').length).toBeGreaterThan(0);
  });

  it('forces the icon-bar and badge variants without crashing', () => {
    // The eye is the one action with a `pressed` axis, so the toggle branch and the
    // plain-activation branch are both exercised here; the badges cover both label
    // regimes — a constant name while wired, a state-describing one while static.
    render(
      <>
        {actionIconBarNode({ hover: true, active: true, pressed: true })}
        {actionIconBarNode({ disabled: true, staticBar: true })}
        {statusBadgeNode({ hover: true, active: true, disabled: true })}
        {statusBadgeNode({ staticBadge: true })}
        {notificationBadgeNode({ hover: true, active: true, count: 12 })}
        {notificationBadgeNode({ disabled: true, staticBadge: true })}
      </>
    );

    // The eye is the bar's only toggle, so it is the one action carrying
    // `aria-pressed`; activating it exercises the tile's no-op toggle. The bar
    // NEVER self-flips `pressed`, so the attribute is unchanged afterwards.
    const eye: HTMLElement = screen.getByRole('button', { name: 'Видимість' });
    fireEvent.click(eye);
    expect(eye).toHaveAttribute('aria-pressed', 'true');
    const staticName = 'Завдання не виконано';
    expect(screen.getByRole('img', { name: staticName })).toBeInTheDocument();
  });
});
