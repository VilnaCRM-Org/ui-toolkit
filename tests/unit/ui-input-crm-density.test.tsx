import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';

import UiInput from '../../src/components/ui-input';
import {
  crmInputSlotStyles,
  densitySlotStyles,
} from '../../src/components/ui-input/crm-slot-styles';
import { inputSlotStyles } from '../../src/components/ui-input/slot-styles';
import UiTextFieldForm from '../../src/components/ui-text-field-form';
import { crmBreakpointValues } from '../../src/utils/breakpoint-tokens';
import { fontFamilies } from '../../src/utils/font-tokens';
import { createUiTheme } from '../../src/utils/ui-theme';

const theme = createUiTheme();
const crmTheme = createUiTheme({ breakpoints: { values: crmBreakpointValues } });

const crmNative: Record<string, unknown> = {
  fontFamily: fontFamilies.inter,
  fontSize: '1rem',
  fontWeight: '500',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: '#57595B',
  boxSizing: 'border-box',
  height: 'clamp(3rem, 4vw, 4rem)',
  padding: '0 clamp(1.25rem, 2vw, 1.75rem)',
  background: 'transparent',
  '&::placeholder': {
    color: '#969B9D',
    fontFamily: fontFamilies.inter,
    fontSize: '0.875rem',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '1.125rem',
  },
  '@media (min-width:768px)': {
    height: '4.9375rem',
    '&::placeholder': { fontSize: '1.125rem', fontWeight: '400' },
  },
  '@media (min-width:1440px)': {
    maxHeight: '4rem',
    '&::placeholder': { fontSize: '1rem' },
  },
  '&:disabled': {
    backgroundColor: '#E1E7EA',
    color: '#969B9D',
    WebkitTextFillColor: '#969B9D',
  },
};

function FormField({ density }: { density?: 'crm' }): React.ReactElement {
  const { control } = useForm<{ email: string }>({ defaultValues: { email: 'a@b.c' } });
  return <UiTextFieldForm control={control} name="email" label="Email" density={density} />;
}

describe('UiInput crm density styles', () => {
  it('builds the exact crm native input rules', () => {
    const input = crmInputSlotStyles(theme).root.input as Record<string, unknown>;
    expect(input).toEqual(crmNative);
  });

  it('reads md and xl from the resolved theme breakpoints', () => {
    const custom = createUiTheme({
      breakpoints: { values: { xs: 0, sm: 500, md: 900, lg: 1200, xl: 1600 } },
    });
    const keys: string[] = Object.keys(crmInputSlotStyles(custom).root.input as object);
    expect(keys).toContain('@media (min-width:900px)');
    expect(keys).toContain('@media (min-width:1600px)');
    expect(keys.filter((key: string) => key.startsWith('@media'))).toHaveLength(2);
  });

  it('keys no rule to 1130px or to sm', () => {
    const text: string = JSON.stringify(crmInputSlotStyles(crmTheme).root);
    expect(text).not.toContain('1130');
    expect(text).not.toContain('max-width');
    expect(text).not.toContain('480');
  });

  it('keeps the kit outline, helper and focus slots', () => {
    const crm = crmInputSlotStyles(theme);
    const kit = inputSlotStyles(theme);
    expect(crm.inputRoot).toBe(kit.inputRoot);
    expect(crm.notchedOutline).toBe(kit.notchedOutline);
    expect(crm.formHelperText).toBe(kit.formHelperText);
    expect(crm.inputLabel).toBe(kit.inputLabel);
    expect(crm.root).not.toEqual(kit.root);
  });

  it('selects the styles by density', () => {
    expect(densitySlotStyles(theme, 'crm')).toBe(crmInputSlotStyles(theme));
    expect(densitySlotStyles(theme, undefined)).toBe(inputSlotStyles(theme));
  });

  it('leaves the kit native input rules unchanged', () => {
    const input = inputSlotStyles(theme).root.input as Record<string, unknown>;
    expect(input.height).toBe('4rem');
    expect(input.padding).toBe('0 1.75rem');
    expect(input.background).toBe('#FFF');
    expect(input).toHaveProperty(['@media (max-width: 1130px)', 'height'], '4.938rem');
    expect(input).toHaveProperty(['@media (max-width: 640px)', 'height'], '3rem');
    expect(input).not.toHaveProperty('boxSizing');
  });
});

describe('UiInput crm density rendering', () => {
  it('paints the typed value in Inter 500 grey250', () => {
    render(<UiInput label="Name" density="crm" defaultValue="Ann" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveStyle({
      fontWeight: '500',
      color: 'rgb(87, 89, 91)',
    });
  });

  it('keeps the default value weight off 500', () => {
    render(<UiInput label="Name" defaultValue="Ann" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveStyle({ fontWeight: '500' });
  });

  it('is forwarded by UiTextFieldForm', () => {
    render(
      <ThemeProvider theme={crmTheme}>
        <FormField density="crm" />
      </ThemeProvider>
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveStyle({
      fontWeight: '500',
      color: 'rgb(87, 89, 91)',
    });
  });

  it('keeps UiTextFieldForm on the kit styles without density', () => {
    render(<FormField />);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveStyle({ fontWeight: '500' });
  });
});
