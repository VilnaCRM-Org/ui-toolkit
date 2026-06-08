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
    const user = userEvent.setup();
    setup();
    const trigger: HTMLElement = screen.getByText(triggerText);
    await user.click(trigger);
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole(tooltipRole)).not.toBeInTheDocument();
    });
  });
});
