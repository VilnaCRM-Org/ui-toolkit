import { ThemeProvider } from '@mui/material/styles';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import websiteColorTheme from '@/components/UiColorTheme';

/**
 * Renders a component wrapped in the toolkit's default theme. The shared i18n
 * instance is initialised globally in jest.setup (via `react-i18next`), so
 * `useTranslation`/`Trans` resolve keys without an explicit provider here.
 *
 * Use for components that read from a parent ThemeProvider; presentational
 * primitives that self-provide their theme can use Testing Library's `render`
 * directly.
 */
export default function renderWithProviders(ui: React.ReactElement): RenderResult {
  return render(<ThemeProvider theme={websiteColorTheme}>{ui}</ThemeProvider>);
}
