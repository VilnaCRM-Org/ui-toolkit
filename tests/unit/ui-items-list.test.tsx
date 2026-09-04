import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiItemRow from '../../src/components/ui-item-row';
import UiItemsList from '../../src/components/ui-items-list';
import { listSx } from '../../src/components/ui-items-list/styles';

import mockConsoleError from './utils/mock-console-error';

const noop: () => void = () => undefined;

function sampleRows(): React.ReactElement[] {
  return [
    <UiItemRow
      key="get"
      method="get"
      path="/pet/{petID}"
      description="Reads a pet"
      onToggle={noop}
    />,
    <UiItemRow
      key="put"
      method="put"
      path="/pet"
      description="Update existing pet"
      onToggle={noop}
    />,
    <UiItemRow key="post" method="post" path="/put/{petID}" description="Update existing pet" />,
  ];
}

// Rows whose identity is observable from the outside: each holds an uncontrolled
// input, so a row React rebuilt instead of moved comes back with an empty box.
function KeyedInputs({ order }: Readonly<{ order: readonly string[] }>): React.ReactElement {
  return (
    <UiItemsList>
      {order.map((name: string) => (
        <input key={name} aria-label={name} />
      ))}
    </UiItemsList>
  );
}

describe('UiItemsList — semantic list structure', () => {
  it('renders a role="list" wrapping one listitem per child', () => {
    render(<UiItemsList>{sampleRows()}</UiItemsList>);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('nests the row as the sole child of its list item', () => {
    render(<UiItemsList>{sampleRows()}</UiItemsList>);

    const items: HTMLElement[] = screen.getAllByRole('listitem');
    expect(
      within(items[0]!).getByRole('button', { name: 'GET /pet/{petID} Reads a pet' })
    ).toBeInTheDocument();
    expect(
      within(items[1]!).getByRole('button', { name: 'PUT /pet Update existing pet' })
    ).toBeInTheDocument();
    // The unwired third row is static content inside its own list item.
    expect(within(items[2]!).getByText('/put/{petID}')).toBeInTheDocument();
    expect(within(items[2]!).queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders each list item as a real <li>', () => {
    render(<UiItemsList>{sampleRows()}</UiItemsList>);
    screen.getAllByRole('listitem').forEach((li: HTMLElement) => expect(li.tagName).toBe('LI'));
  });

  it('exposes its display name', () => {
    expect(UiItemsList.displayName).toBe('UiItemsList');
  });
});

describe('UiItemsList — accessible name', () => {
  it('carries no accessible name by default', () => {
    render(<UiItemsList>{sampleRows()}</UiItemsList>);
    expect(screen.getByRole('list')).not.toHaveAttribute('aria-label');
  });

  it('names the list from the optional aria-label prop', () => {
    render(<UiItemsList aria-label="Endpoints">{sampleRows()}</UiItemsList>);
    expect(screen.getByRole('list', { name: 'Endpoints' })).toBeInTheDocument();
  });
});

describe('UiItemsList — empty collection', () => {
  it('renders nothing (no list role) when there are no children', () => {
    render(<UiItemsList />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders nothing when children are all nullish/false', () => {
    render(
      <UiItemsList>
        {null}
        {false}
        {undefined}
      </UiItemsList>
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('adds no interactive behaviour and no live region to the list', () => {
    render(<UiItemsList aria-label="Endpoints">{sampleRows()}</UiItemsList>);
    const list: HTMLElement = screen.getByRole('list');
    expect(list).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('UiItemsList — child key handling', () => {
  it('wraps children that carry no explicit key', () => {
    render(
      <UiItemsList>
        <UiItemRow method="get" path="/a" onToggle={noop} />
        <UiItemRow method="put" path="/b" onToggle={noop} />
      </UiItemsList>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'GET /a' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PUT /b' })).toBeInTheDocument();
  });

  it('wraps a non-element (text) child in its own list item', () => {
    render(<UiItemsList>plain text node</UiItemsList>);
    const items: HTMLElement[] = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('plain text node');
  });
});

describe('UiItemsList — fragment flattening', () => {
  it('wraps each row in its own <li> when rows are grouped in a fragment', () => {
    render(
      <UiItemsList>
        <>
          <UiItemRow key="get" method="get" path="/a" onToggle={noop} />
          <UiItemRow key="put" method="put" path="/b" onToggle={noop} />
        </>
      </UiItemsList>
    );
    // The fragment must not collapse both rows into a single list item.
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'GET /a' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PUT /b' })).toBeInTheDocument();
  });

  it('flattens a fragment mixed with a direct sibling row into one <li> per row', () => {
    render(
      <UiItemsList>
        <UiItemRow method="get" path="/a" onToggle={noop} />
        <>
          <UiItemRow method="put" path="/b" onToggle={noop} />
          <UiItemRow method="post" path="/c" onToggle={noop} />
        </>
      </UiItemsList>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('flattens nested fragments', () => {
    render(
      <UiItemsList>
        <>
          <UiItemRow method="get" path="/a" onToggle={noop} />
          <>
            <UiItemRow method="put" path="/b" onToggle={noop} />
          </>
        </>
      </UiItemsList>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

// A row's key never reaches the DOM, so it is asserted through the two effects
// React does make observable: it reports a collision through console.error, and
// a key that stays put keeps its <li> — and the uncontrolled state inside it —
// alive across a reorder instead of rebuilding it.
describe('UiItemsList — row key identity', () => {
  const consoleError: { readonly spy: jest.SpyInstance } = mockConsoleError();

  // React 19 phrases a collision as "Encountered two children with the same
  // key, `x`." — spelled out here rather than imported — and everything else on
  // the error channel is none of this suite's business.
  const collision: RegExp = /two children with the same key/;

  function duplicateKeyReports(): unknown[][] {
    return consoleError.spy.mock.calls.filter(([message]) => collision.test(String(message)));
  }

  it('keys a fragment row apart from the sibling holding its position', () => {
    render(
      <UiItemsList>
        <UiItemRow method="get" path="/a" onToggle={noop} />
        <>
          <UiItemRow method="put" path="/b" onToggle={noop} />
          <UiItemRow method="post" path="/c" onToggle={noop} />
        </>
      </UiItemsList>
    );

    // The fragment sits at position 1 and its rows are keyless, so without the
    // fragment's own key in the recursion prefix its first row falls back to
    // '.0' — exactly the key the direct sibling above it already holds.
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(duplicateKeyReports()).toHaveLength(0);
  });

  it('gives sibling rows distinct keys', () => {
    render(<UiItemsList>{sampleRows()}</UiItemsList>);

    // An empty key would collapse all three rows onto the one '' identity.
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(duplicateKeyReports()).toHaveLength(0);
  });

  it('falls back to the position for children carrying no key of their own', () => {
    render(
      <UiItemsList>
        {'alpha'}
        {'beta'}
      </UiItemsList>
    );

    // A text child has no key, so the index has to stand in for one. Keying on
    // the key AND the index rather than the key OR the index would leave both
    // of these rows on the same 'null'.
    expect(screen.getByText('alpha').tagName).toBe('LI');
    expect(screen.getByText('beta').tagName).toBe('LI');
    expect(duplicateKeyReports()).toHaveLength(0);
  });

  it('carries an explicit key with its row when the rows are reordered', async () => {
    const user: UserEvent = userEvent.setup();
    const { rerender } = render(<KeyedInputs order={['first', 'second']} />);

    await user.type(screen.getByRole('textbox', { name: 'first' }), 'kept');
    rerender(<KeyedInputs order={['second', 'first']} />);

    // The explicit key rides through, so React moves the existing <li> and the
    // uncontrolled text moves with it. Keying rows by position instead would
    // hand each <li> the other row's element and remount both, emptying them.
    expect(screen.getByRole('textbox', { name: 'first' })).toHaveValue('kept');
    expect(screen.getByRole('textbox', { name: 'second' })).toHaveValue('');
  });
});

describe('UiItemsList — consumer sx', () => {
  it('applies an object sx to the ul', () => {
    render(<UiItemsList sx={{ marginTop: '1rem' }}>{sampleRows()}</UiItemsList>);
    expect(screen.getByRole('list')).toHaveStyle({ marginTop: '1rem' });
  });

  it('applies an array sx to the ul', () => {
    render(
      <UiItemsList sx={[{ marginTop: '1rem' }, { paddingTop: '2rem' }]}>{sampleRows()}</UiItemsList>
    );
    const list: HTMLElement = screen.getByRole('list');
    expect(list).toHaveStyle({ marginTop: '1rem' });
    expect(list).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('UiItemsList — website row-gap tiers', () => {
  it('widens the row gap through the tablet band and tightens it again on mobile', () => {
    // Mirrors the website `.opblock` margin-bottom: 8px, 16px through 641-1024px,
    // back to 8px below 640px.
    expect(listSx as Record<string, unknown>).toMatchObject({
      gap: '0.5rem',
      '@media (max-width: 1024px)': { gap: '1rem' },
      '@media (max-width: 640px)': { gap: '0.5rem' },
    });
  });
});
