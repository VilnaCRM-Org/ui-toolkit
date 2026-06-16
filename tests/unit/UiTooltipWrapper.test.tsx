import { useMediaQuery } from '@mui/material';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import WrapperUiTooltip from '../../src/components/UiTooltip/TooltipWrapper';

const triggerText: string = 'Trigger';
const tooltipContent: string = 'Tooltip Text';
const tooltipRole: string = 'tooltip';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

const mockedUseMediaQuery: jest.Mock = useMediaQuery as unknown as jest.Mock;

describe('WrapperUiTooltip', () => {
  const setup: () => void = () => {
    render(<WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the tooltip trigger', () => {
    setup();
    const trigger: HTMLElement = screen.getByText(triggerText);
    expect(trigger).toBeInTheDocument();
  });

  it('opens the tooltip on click', () => {
    setup();
    const trigger: HTMLElement = screen.getByText(triggerText);
    fireEvent.click(trigger);
    const tooltip: HTMLElement = screen.getByText(tooltipContent);
    expect(tooltip).toBeInTheDocument();
  });

  it('closes the tooltip on click away', async () => {
    const user: { click: (element: Element) => Promise<void> } = userEvent.setup();
    setup();
    const trigger: HTMLElement = screen.getByText(triggerText);
    await user.click(trigger);
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
    });
  });

  it('opens the tooltip when Enter is pressed on the trigger', () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(screen.getByText(tooltipContent)).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the tooltip when Space is pressed on the trigger', () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: ' ' });

    expect(screen.getByText(tooltipContent)).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles the tooltip closed when Enter is pressed twice', async () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
    });
  });

  it('closes the open tooltip when Escape is pressed', async () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
    });
  });

  it('does nothing when Escape is pressed while the tooltip is closed', () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
  });

  it('ignores keys other than Enter, Space and Escape', () => {
    setup();
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'a' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
  });

  it('closes an open tooltip when the viewport media query changes', () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const { rerender } = render(
      <WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>
    );
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    mockedUseMediaQuery.mockReturnValue(true);
    rerender(<WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies the accessible trigger label when provided', () => {
    const label: string = 'More info';
    render(
      <WrapperUiTooltip title={tooltipContent} triggerLabel={label}>
        {triggerText}
      </WrapperUiTooltip>
    );

    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});

describe('WrapperUiTooltip mutation-hardening', () => {
  const maxWidthQuery: string = '(max-width: 640px)';
  const minWidthQuery: string = '(min-width: 640px)';

  it('queries the exact max-width and min-width breakpoint strings', () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>);

    expect(mockedUseMediaQuery).toHaveBeenCalledWith(maxWidthQuery);
    expect(mockedUseMediaQuery).toHaveBeenCalledWith(minWidthQuery);
  });

  it('keeps an open tooltip open when a non-Escape key is pressed', () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>);
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(trigger, { key: 'Tab' });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();
  });

  it('does not close an open tooltip on an arrow key (Escape branch is exact)', async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    render(<WrapperUiTooltip title={tooltipContent}>{triggerText}</WrapperUiTooltip>);
    const trigger: HTMLElement = screen.getByRole('button');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(screen.getByRole(tooltipRole)).toBeInTheDocument();
    });
  });
});
