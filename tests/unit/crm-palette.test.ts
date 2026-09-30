import type { Theme } from '@mui/material';

import {
  crmColorTheme,
  crmPalette,
  sharedPalette,
  websiteColorTheme,
} from '../../src/components/ui-color-theme';
import { createUiTheme, isUiTheme } from '../../src/utils/ui-theme';

const CRM_STATUS: Record<'success' | 'warning' | 'info', string> = {
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

describe('crmPalette', () => {
  it.each(Object.entries(CRM_STATUS))('carries CRM %s ink %s', (token, colour) => {
    expect(crmPalette[token as keyof typeof CRM_STATUS].main).toBe(colour);
  });

  it('keeps every other shared token unchanged', () => {
    const shared: string[] = Object.keys(sharedPalette).filter(token => !(token in CRM_STATUS));
    for (const token of shared) {
      expect(crmPalette[token as keyof typeof sharedPalette]).toEqual(
        sharedPalette[token as keyof typeof sharedPalette]
      );
    }
  });

  it('leaves the website palette on its own success ink', () => {
    expect(sharedPalette.success.main).toBe('#38B386');
    expect(websiteColorTheme.palette.success.main).toBe('#38B386');
  });

  it('builds crmColorTheme from the CRM palette', () => {
    expect(crmColorTheme.palette.success.main).toBe(CRM_STATUS.success);
    expect(crmColorTheme.palette.warning.main).toBe(CRM_STATUS.warning);
    expect(crmColorTheme.palette.info.main).toBe(CRM_STATUS.info);
  });

  it('gives the crm UI theme the CRM palette and breakpoints', () => {
    const theme: Theme = createUiTheme({ variant: 'crm' });

    expect(theme.palette.success.main).toBe(CRM_STATUS.success);
    expect(theme.palette.info.main).toBe(CRM_STATUS.info);
    expect(theme.breakpoints.values.sm).toBe(480);
    expect(isUiTheme(theme)).toBe(true);
  });

  it('keeps the website UI theme on the shared palette', () => {
    const theme: Theme = createUiTheme();

    expect(theme.palette.success.main).toBe(sharedPalette.success.main);
    expect(theme.breakpoints.values.sm).toBe(640);
  });
});
