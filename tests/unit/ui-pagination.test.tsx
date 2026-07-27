import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiPagination } from '../../src/components';
import {
  usePaginationModel,
  type PaginationModel,
} from '../../src/components/ui-pagination/use-pagination-model';

const noop: (page: number) => void = () => undefined;

// A page button's accessible name is `Сторінка N`; the visible number lives inside
// that name (WCAG 2.5.3). Fetch each cell through that semantic name.
function pageButton(page: number): HTMLElement {
  return screen.getByRole('button', { name: `Сторінка ${page}` });
}

describe('UiPagination — rendering and accessible names', () => {
  it('renders a nav landmark named "Пагінація" by default', () => {
    render(<UiPagination value={1} count={5} onChange={noop} />);
    expect(screen.getByRole('navigation', { name: 'Пагінація' })).toBeInTheDocument();
  });

  it('names the nav landmark from a custom aria-label', () => {
    render(<UiPagination value={1} count={5} aria-label="Сторінки списку" onChange={noop} />);
    expect(screen.getByRole('navigation', { name: 'Сторінки списку' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Пагінація' })).not.toBeInTheDocument();
  });

  it('renders one page button per visible slot, named from its number', () => {
    render(<UiPagination value={1} count={5} onChange={noop} />);
    [1, 2, 3, 4, 5].forEach((page: number) => expect(pageButton(page)).toBeInTheDocument());
    // Five page cells plus the previous/next links.
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('renders the previous/next links with the default Ukrainian labels', () => {
    render(<UiPagination value={2} count={5} onChange={noop} />);
    expect(screen.getByRole('button', { name: 'Попередня' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Наступна' })).toBeInTheDocument();
  });

  it('renders custom previous/next labels', () => {
    render(
      <UiPagination value={2} count={5} previousLabel="Назад" nextLabel="Далі" onChange={noop} />
    );
    expect(screen.getByRole('button', { name: 'Назад' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Далі' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Попередня' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Наступна' })).not.toBeInTheDocument();
  });

  it('exposes its display name', () => {
    expect(UiPagination.displayName).toBe('UiPagination');
  });
});

describe('UiPagination — current page', () => {
  it('marks only the current page with aria-current="page"', () => {
    render(<UiPagination value={3} count={5} onChange={noop} />);
    expect(pageButton(3)).toHaveAttribute('aria-current', 'page');
    [1, 2, 4, 5].forEach((page: number) =>
      expect(pageButton(page)).not.toHaveAttribute('aria-current')
    );
  });

  it('moves aria-current when the controlled value changes', () => {
    const { rerender } = render(<UiPagination value={3} count={5} onChange={noop} />);
    expect(pageButton(3)).toHaveAttribute('aria-current', 'page');

    rerender(<UiPagination value={4} count={5} onChange={noop} />);
    expect(pageButton(4)).toHaveAttribute('aria-current', 'page');
    expect(pageButton(3)).not.toHaveAttribute('aria-current');
  });
});

describe('UiPagination — selection', () => {
  it('calls onChange with the clicked page number', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={1} count={5} onChange={onChange} />);

    await user.click(pageButton(3));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('re-emits the current page number when the current cell is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={3} count={5} onChange={onChange} />);

    // The current cell is not disabled, so activating it fires onChange with its
    // own page — the component leaves "same page" de-duping to the consumer.
    await user.click(pageButton(3));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not throw when a page is clicked without an onChange handler', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiPagination value={1} count={5} />);

    await user.click(pageButton(2));
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('honours siblingCount and boundaryCount when choosing the visible window', () => {
    render(
      <UiPagination value={6} count={10} siblingCount={0} boundaryCount={2} onChange={noop} />
    );

    // Window is [1, 2, …, 6, …, 9, 10].
    [1, 2, 6, 9, 10].forEach((page: number) => expect(pageButton(page)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Сторінка 4' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сторінка 7' })).not.toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);
  });
});

describe('UiPagination — previous/next links', () => {
  it('advances to the next page when Наступна is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={3} count={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Наступна' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('steps back to the previous page when Попередня is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={3} count={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Попередня' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('self-disables the previous link on the first page and keeps next operable', () => {
    render(<UiPagination value={1} count={5} onChange={noop} />);
    const previous: HTMLElement = screen.getByRole('button', { name: 'Попередня' });
    // Boundary self-disable keeps the link focusable (aria-disabled, not native
    // disabled) so keyboard focus is never dropped to <body> (WCAG 2.4.3).
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(previous).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Наступна' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Наступна' })).not.toHaveAttribute('aria-disabled');
  });

  it('self-disables the next link on the last page and keeps previous operable', () => {
    render(<UiPagination value={5} count={5} onChange={noop} />);
    const next: HTMLElement = screen.getByRole('button', { name: 'Наступна' });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Попередня' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Попередня' })).not.toHaveAttribute('aria-disabled');
  });

  it('does not emit when the disabled previous link is clicked at the first page', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={1} count={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Попередня' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps keyboard focus on the link when it self-disables at the boundary', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    const { rerender } = render(<UiPagination value={2} count={5} onChange={onChange} />);

    const previous: HTMLElement = screen.getByRole('button', { name: 'Попередня' });
    previous.focus();
    await user.click(previous);
    expect(onChange).toHaveBeenCalledWith(1);

    // The consumer feeds the new page back; the link self-disables but must keep
    // focus instead of dropping it to <body> (WCAG 2.4.3).
    rerender(<UiPagination value={1} count={5} onChange={onChange} />);
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(previous).toHaveFocus();
  });
});

describe('UiPagination — whole-component disabled', () => {
  it('disables every page cell and both links', () => {
    render(<UiPagination value={3} count={5} disabled onChange={noop} />);
    screen.getAllByRole('button').forEach((button: HTMLElement) => expect(button).toBeDisabled());
  });

  it('emits nothing when a disabled cell is clicked', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={3} count={5} disabled onChange={onChange} />);

    await user.click(pageButton(2));
    await user.click(screen.getByRole('button', { name: 'Наступна' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('still exposes aria-current on the current page while disabled', () => {
    render(<UiPagination value={3} count={5} disabled onChange={noop} />);
    expect(pageButton(3)).toHaveAttribute('aria-current', 'page');
    expect(pageButton(3)).toBeDisabled();
  });
});

describe('UiPagination — ellipsis', () => {
  it('renders the skipped-pages marker as a non-interactive, hidden span', () => {
    render(<UiPagination value={1} count={10} onChange={noop} />);

    const ellipsis: HTMLElement = screen.getByText('...');
    expect(ellipsis.tagName).toBe('SPAN');
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');

    // Hidden pages have no button; the ellipsis is not one either.
    expect(screen.queryByRole('button', { name: 'Сторінка 7' })).not.toBeInTheDocument();
    // Six page cells (1-5, 10) plus previous/next.
    expect(screen.getAllByRole('button')).toHaveLength(8);
  });
});

describe('UiPagination — keyboard activation', () => {
  it('activates a page cell with Enter', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={1} count={5} onChange={onChange} />);

    pageButton(3).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('activates a page cell with Space', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiPagination value={1} count={5} onChange={onChange} />);

    pageButton(4).focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(4);
  });
});

describe('UiPagination — chevron glyphs', () => {
  it('renders left and right chevrons, decorative and hidden from assistive tech', () => {
    render(<UiPagination value={2} count={5} onChange={noop} />);

    // eslint-disable-next-line testing-library/no-node-access -- decorative glyphs, no role
    const svgs: NodeListOf<SVGElement> = document.querySelectorAll<SVGElement>('nav svg');
    expect(svgs).toHaveLength(2);
    svgs.forEach((svg: SVGElement) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    });

    const paths: NodeListOf<SVGPathElement> =
      // eslint-disable-next-line testing-library/no-node-access -- decorative glyphs, no role
      document.querySelectorAll<SVGPathElement>('nav svg path');
    const ds: (string | null)[] = Array.from(paths).map((path: SVGPathElement) =>
      path.getAttribute('d')
    );
    expect(ds).toEqual(['M12.5 5L7.5 10L12.5 15', 'M7.5 5L12.5 10L7.5 15']);
    paths.forEach((path: SVGPathElement) => expect(path).toHaveAttribute('stroke-width', '1.67'));
  });
});

describe('UiPagination — consumer sx', () => {
  it('renders with an object sx applied to the nav', () => {
    render(<UiPagination value={1} count={5} sx={{ marginTop: '1rem' }} onChange={noop} />);
    expect(screen.getByRole('navigation')).toHaveStyle({ marginTop: '1rem' });
  });

  it('renders with an array sx applied to the nav', () => {
    render(
      <UiPagination
        value={1}
        count={5}
        sx={[{ marginTop: '1rem' }, { paddingTop: '2rem' }]}
        onChange={noop}
      />
    );
    const nav: HTMLElement = screen.getByRole('navigation');
    expect(nav).toHaveStyle({ marginTop: '1rem' });
    expect(nav).toHaveStyle({ paddingTop: '2rem' });
  });
});

describe('usePaginationModel — selection guards and flags', () => {
  it('fires onChange for an in-range page', () => {
    const onChange: jest.Mock = jest.fn();
    const model: PaginationModel = usePaginationModel({ value: 3, count: 5, onChange });

    model.select(4);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('ignores a page below 1', () => {
    const onChange: jest.Mock = jest.fn();
    const model: PaginationModel = usePaginationModel({ value: 3, count: 5, onChange });

    model.select(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores a page above count', () => {
    const onChange: jest.Mock = jest.fn();
    const model: PaginationModel = usePaginationModel({ value: 3, count: 5, onChange });

    model.select(6);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores every selection while disabled', () => {
    const onChange: jest.Mock = jest.fn();
    const model: PaginationModel = usePaginationModel({
      value: 3,
      count: 5,
      disabled: true,
      onChange,
    });

    model.select(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves one page back with goPrevious and one forward with goNext', () => {
    const back: jest.Mock = jest.fn();
    usePaginationModel({ value: 3, count: 5, onChange: back }).goPrevious();
    expect(back).toHaveBeenCalledWith(2);

    const forward: jest.Mock = jest.fn();
    usePaginationModel({ value: 3, count: 5, onChange: forward }).goNext();
    expect(forward).toHaveBeenCalledWith(4);
  });

  it('makes goPrevious inert on the first page and goNext inert on the last', () => {
    const first: jest.Mock = jest.fn();
    usePaginationModel({ value: 1, count: 5, onChange: first }).goPrevious();
    expect(first).not.toHaveBeenCalled();

    const last: jest.Mock = jest.fn();
    usePaginationModel({ value: 5, count: 5, onChange: last }).goNext();
    expect(last).not.toHaveBeenCalled();
  });

  it('tolerates a missing onChange handler', () => {
    const model: PaginationModel = usePaginationModel({ value: 2, count: 5 });
    expect(() => model.select(3)).not.toThrow();
  });

  it('reports prevDisabled on the first page and whenever disabled', () => {
    expect(usePaginationModel({ value: 1, count: 5 }).prevDisabled).toBe(true);
    expect(usePaginationModel({ value: 2, count: 5 }).prevDisabled).toBe(false);
    expect(usePaginationModel({ value: 3, count: 5, disabled: true }).prevDisabled).toBe(true);
  });

  it('reports nextDisabled on the last page and whenever disabled', () => {
    expect(usePaginationModel({ value: 5, count: 5 }).nextDisabled).toBe(true);
    expect(usePaginationModel({ value: 4, count: 5 }).nextDisabled).toBe(false);
    expect(usePaginationModel({ value: 3, count: 5, disabled: true }).nextDisabled).toBe(true);
  });

  it('defaults the previous, next and nav labels', () => {
    const model: PaginationModel = usePaginationModel({ value: 1, count: 5 });
    expect(model.previousLabel).toBe('Попередня');
    expect(model.nextLabel).toBe('Наступна');
    expect(model.navLabel).toBe('Пагінація');
  });

  it('marks only the current value as current', () => {
    const model: PaginationModel = usePaginationModel({ value: 3, count: 5 });
    expect(model.isCurrent(3)).toBe(true);
    expect(model.isCurrent(2)).toBe(false);
  });

  it('builds the page items from count and value', () => {
    expect(usePaginationModel({ value: 1, count: 5 }).items).toEqual([1, 2, 3, 4, 5]);
  });

  // An out-of-range or malformed controlled `value` must not strip
  // `aria-current` from every cell or freeze a navigation direction.
  it('clamps a below-range value to the first page', () => {
    const model: PaginationModel = usePaginationModel({ value: 0, count: 5 });
    expect(model.isCurrent(1)).toBe(true);
    expect(model.prevAtBoundary).toBe(true);
    expect(model.nextDisabled).toBe(false);
  });

  it('clamps an above-range value to the last page', () => {
    const model: PaginationModel = usePaginationModel({ value: 99, count: 5 });
    expect(model.isCurrent(5)).toBe(true);
    expect(model.nextAtBoundary).toBe(true);
    expect(model.prevDisabled).toBe(false);
  });

  it('rounds a fractional value to the nearest page', () => {
    expect(usePaginationModel({ value: 2.4, count: 5 }).isCurrent(2)).toBe(true);
    expect(usePaginationModel({ value: 2.5, count: 5 }).isCurrent(3)).toBe(true);
  });

  it('falls back to the first page for a non-finite value', () => {
    const model: PaginationModel = usePaginationModel({ value: Number.NaN, count: 5 });
    expect(model.isCurrent(1)).toBe(true);
    expect(model.items).toEqual([1, 2, 3, 4, 5]);
  });

  it('normalises a sub-1 count to a single page', () => {
    const model: PaginationModel = usePaginationModel({ value: 3, count: 0 });
    expect(model.items).toEqual([1]);
    expect(model.isCurrent(1)).toBe(true);
    expect(model.prevAtBoundary).toBe(true);
    expect(model.nextAtBoundary).toBe(true);
  });

  it('normalises a non-finite count to a single page', () => {
    expect(usePaginationModel({ value: 1, count: Number.NaN }).items).toEqual([1]);
  });
});
