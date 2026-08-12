import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import UiCardList from '../../src/components/ui-card-list';
import CardContent from '../../src/components/ui-card-list/card-content';
import type { UiCardItemData } from '../../src/components/ui-card-list/types';
import UiCardItem from '../../src/components/ui-card-list/ui-card-item';
import UiImage from '../../src/components/ui-image';
import UiTypography from '../../src/components/ui-typography';

import mockConsoleWarn from './utils/mock-console-warn';

// UiImage and UiTypography are the leaves of the card subtree, so how often
// their function bodies run IS the render count of the card and of the card
// body. Both are stand-ins here; the memoized components under test are real.
jest.mock('../../src/components/ui-image', () => {
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    default: jest.fn(() => mockReact.createElement('div')),
  };
});

jest.mock('../../src/components/ui-typography', () => {
  const actual: typeof import('../../src/components/ui-typography') = jest.requireActual(
    '../../src/components/ui-typography'
  );
  const mockReact: typeof import('react') = jest.requireActual('react');

  return {
    __esModule: true,
    // `typographyTheme` stays real: CardContent hoists it into a theme scope.
    ...actual,
    default: jest.fn((props: { children?: React.ReactNode }) =>
      mockReact.createElement('span', null, props.children)
    ),
  };
});

const mockedUiImage: jest.Mock = UiImage as unknown as jest.Mock;
const mockedUiTypography: jest.Mock = UiTypography as unknown as jest.Mock;

const firstItem: UiCardItemData = {
  type: 'smallCard',
  id: 'card-1',
  imageSrc: 'https://example.com/first.png',
  title: 'First title',
  text: 'First text',
  alt: 'First alt',
};
const secondItem: UiCardItemData = {
  type: 'smallCard',
  id: 'card-2',
  imageSrc: 'https://example.com/second.png',
  title: 'Second title',
  text: 'Second text',
  alt: 'Second alt',
};
const stableCardList: UiCardItemData[] = [firstItem, secondItem];

const BUMP_LABEL: string = 'bump';

// A parent whose own state changes on every click while the subtree props stay
// referentially identical — the exact shape the memoization has to absorb.
function Harness({ children }: { children: React.ReactNode }): React.ReactElement {
  const [tick, setTick] = React.useState(0);

  return (
    <>
      <button type="button" onClick={() => setTick(tick + 1)}>
        {BUMP_LABEL}
      </button>
      <span>{`tick ${tick}`}</span>
      {children}
    </>
  );
}

function bumpParent(): void {
  fireEvent.click(screen.getByRole('button', { name: BUMP_LABEL }));
}

describe('UiCardList memoization', () => {
  // The nullish-fallback case below deliberately trips the dev warning.
  mockConsoleWarn();

  it('does not re-render card children when the parent re-renders the same cardList', () => {
    render(
      <Harness>
        <UiCardList cardList={stableCardList} />
      </Harness>
    );

    expect(mockedUiImage).toHaveBeenCalledTimes(stableCardList.length);

    bumpParent();

    expect(screen.getByText('tick 1')).toBeInTheDocument();
    expect(mockedUiImage).toHaveBeenCalledTimes(stableCardList.length);
  });

  it('keeps the empty-list fallback stable across parent re-renders', () => {
    const nullishCardList: UiCardItemData[] = undefined as unknown as UiCardItemData[];

    render(
      <Harness>
        <UiCardList cardList={nullishCardList} />
      </Harness>
    );
    bumpParent();

    // A fresh `[]` per render would give the memoized grid a new prop every
    // time; nothing is rendered either way, so the stable fallback is what
    // keeps the pass cheap.
    expect(screen.getByText('tick 1')).toBeInTheDocument();
    expect(mockedUiImage).not.toHaveBeenCalled();
  });
});

describe('UiCardItem memoization', () => {
  it('does not re-render when its parent re-renders with the same item', () => {
    render(
      <Harness>
        <UiCardItem item={firstItem} />
      </Harness>
    );

    expect(mockedUiImage).toHaveBeenCalledTimes(1);

    bumpParent();

    expect(mockedUiImage).toHaveBeenCalledTimes(1);
  });

  it('still re-renders when the item it is given changes', () => {
    const { rerender } = render(<UiCardItem item={firstItem} />);

    rerender(<UiCardItem item={secondItem} />);

    // The counterpart to the test above: memoization must not swallow a real
    // data change, which a `React.memo` comparator stuck on `true` would.
    expect(mockedUiImage).toHaveBeenCalledTimes(2);
  });
});

describe('CardContent render pass-through', () => {
  it('re-renders with the card that owns it', () => {
    const { rerender } = render(<CardContent item={firstItem} isSmallCard />);

    const titleAndText: number = 2;
    expect(mockedUiTypography).toHaveBeenCalledTimes(titleAndText);

    rerender(<CardContent item={firstItem} isSmallCard />);

    // CardContent is intentionally NOT memoized: `<Trans>` has no i18next
    // subscription of its own, so cutting this path would freeze translated
    // copy on a language change (see ui-card-list-language-change.test.tsx).
    expect(mockedUiTypography).toHaveBeenCalledTimes(titleAndText * 2);
  });
});
