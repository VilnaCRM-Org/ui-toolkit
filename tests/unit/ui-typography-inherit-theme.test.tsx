import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';

import UiTypography from '../../src/components/ui-typography';

const appTheme: ReturnType<typeof createTheme> = createTheme({
  typography: { h4: { fontSize: '3rem' } },
});

describe('UiTypography inheritTheme', () => {
  it('styles the variant from the ambient theme', () => {
    render(
      <ThemeProvider theme={appTheme}>
        <UiTypography variant="h4" inheritTheme>
          Heading
        </UiTypography>
      </ThemeProvider>
    );
    expect(screen.getByText('Heading')).toHaveStyle({ fontSize: '3rem' });
  });

  it('keeps the kit typography without the flag', () => {
    render(
      <ThemeProvider theme={appTheme}>
        <UiTypography variant="h4">Heading</UiTypography>
      </ThemeProvider>
    );
    expect(screen.getByText('Heading')).not.toHaveStyle({ fontSize: '3rem' });
  });

  it('still applies the consumer sx', () => {
    render(
      <UiTypography inheritTheme sx={{ marginTop: '7px' }}>
        Body
      </UiTypography>
    );
    expect(screen.getByText('Body')).toHaveStyle({ marginTop: '7px' });
  });
});
