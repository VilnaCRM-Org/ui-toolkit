import type { Theme, SxProps } from '@mui/material';

import { UiButton, UiCheckbox, UiInput, UiLink } from '../../src/components';
import type { UiButtonProps } from '../../src/components/ui-button/types';
import type { UiCheckboxProps } from '../../src/components/ui-checkbox/types';
import type { UiInputProps } from '../../src/components/ui-input/types';
import type { UiLinkProps } from '../../src/components/ui-link/types';

// This suite asserts the PUBLIC BARREL's export surface and the compile-time
// `sx` prop contracts only. It deliberately renders nothing, which is what
// makes it safe to exclude from the mutation tier (see jest.mutation.config.ts).
// A test that renders belongs in the component's own deep-import suite
// instead, or it gets reloaded for every mutant.

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

const assertMuiSxContract: <T extends SxProps<Theme>>(value: T) => AssertAssignable<T> = <
  T extends SxProps<Theme>,
>(
  value: T
): AssertAssignable<T> => value;

const assertedButtonSx: NonNullable<UiButtonProps['sx']> =
  assertMuiSxContract<NonNullable<UiButtonProps['sx']>>(buttonSxContract);
const assertedCheckboxSx: NonNullable<UiCheckboxProps['sx']> =
  assertMuiSxContract<NonNullable<UiCheckboxProps['sx']>>(checkboxSxContract);
const assertedInputSx: NonNullable<UiInputProps['sx']> =
  assertMuiSxContract<NonNullable<UiInputProps['sx']>>(inputSxContract);
const assertedLinkSx: NonNullable<UiLinkProps['sx']> =
  assertMuiSxContract<NonNullable<UiLinkProps['sx']>>(linkSxContract);

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
});
