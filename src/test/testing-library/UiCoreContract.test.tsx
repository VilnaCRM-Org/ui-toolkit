import type { Theme, SxProps } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';

import { UiButton, UiCheckbox, UiInput, UiLink } from '../../components';
import type { UiButtonProps } from '../../components/UiButton/types';
import type { UiCheckboxProps } from '../../components/UiCheckbox/types';
import type { UiInputProps } from '../../components/UiInput/types';
import type { UiLinkProps } from '../../components/UiLink/types';

const sharedSxFn: (theme: Theme) => { color: string } = (theme: Theme): { color: string } => ({
  color: theme.palette.primary.main,
});

const buttonSxContract: UiButtonProps['sx'] = sharedSxFn;
const checkboxSxContract: UiCheckboxProps['sx'] = sharedSxFn;
const inputSxContract: UiInputProps['sx'] = sharedSxFn;
const linkSxContract: UiLinkProps['sx'] = sharedSxFn;

const inputSharedContractProps: Pick<UiInputProps, 'size' | 'variant'> = {
  size: 'small',
  variant: 'filled',
};

type AssertAssignable<T extends SxProps<Theme>> = T;

const assertMuiSxContract: <T extends SxProps<Theme>>(
  value: T
) => AssertAssignable<T> = <T extends SxProps<Theme>>(value: T): AssertAssignable<T> => value;

const assertedButtonSx: NonNullable<UiButtonProps['sx']> = assertMuiSxContract<
  NonNullable<UiButtonProps['sx']>
>(buttonSxContract);
const assertedCheckboxSx: NonNullable<UiCheckboxProps['sx']> = assertMuiSxContract<
  NonNullable<UiCheckboxProps['sx']>
>(checkboxSxContract);
const assertedInputSx: NonNullable<UiInputProps['sx']> = assertMuiSxContract<
  NonNullable<UiInputProps['sx']>
>(inputSxContract);
const assertedLinkSx: NonNullable<UiLinkProps['sx']> = assertMuiSxContract<
  NonNullable<UiLinkProps['sx']>
>(linkSxContract);

describe('Ui core contract', () => {
  it('exports the four core controls from the package entrypoint', () => {
    expect(UiButton).toBeDefined();
    expect(UiCheckbox).toBeDefined();
    expect(UiInput).toBeDefined();
    expect(UiLink).toBeDefined();
    expect(assertedButtonSx).toBeDefined();
    expect(assertedCheckboxSx).toBeDefined();
    expect(assertedInputSx).toBeDefined();
    expect(assertedLinkSx).toBeDefined();
    expect(inputSharedContractProps).toEqual({
      size: 'small',
      variant: 'filled',
    });
  });

  it('forwards size and variant to UiInput', () => {
    const { container } = render(<UiInput size="small" variant="filled" />);

    expect(container.querySelector('.MuiFilledInput-root')).toBeInTheDocument();
    expect(container.querySelector('.MuiInputBase-sizeSmall')).toBeInTheDocument();
  });
});
