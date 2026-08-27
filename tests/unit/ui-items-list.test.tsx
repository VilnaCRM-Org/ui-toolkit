import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { UiItemRow, UiItemsList } from '../../src/components';

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
