import { render, fireEvent } from '@testing-library/react';

import { UiButton } from '../../components';

import { testText } from './constants';

describe('UiButton', () => {
  it('renders the button with the correct props', () => {
    const onClick: () => void = jest.fn();
    const { getByRole } = render(
      <UiButton
        variant="contained"
        size="medium"
        disabled={false}
        fullWidth={false}
        type="button"
        onClick={onClick}
        sx={{ color: 'red' }}
        name="my-button"
      >
        {testText}
      </UiButton>
    );

    const button: HTMLElement = getByRole('button', { name: testText });
    expect(button).toBeEnabled();
    expect(button).toBeInTheDocument();
  });

  it('calls the onClick handler when the button is clicked', () => {
    const onClick: () => void = jest.fn();
    const { getByRole } = render(<UiButton onClick={onClick}>{testText}</UiButton>);

    const button: HTMLElement = getByRole('button', { name: testText });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('UiButton component', () => {
    it('renders with given text', () => {
      const { getByText } = render(<UiButton>Click me</UiButton>);
      expect(getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
      const onClickMock: () => void = jest.fn();
      const { getByText } = render(<UiButton onClick={onClickMock}>Click me</UiButton>);
      fireEvent.click(getByText('Click me'));
      expect(onClickMock).toHaveBeenCalled();
    });

    it('disables button when disabled prop is true', () => {
      const { getByText } = render(<UiButton disabled>Disabled Button</UiButton>);
      expect(getByText('Disabled Button')).toBeDisabled();
    });
  });
});
