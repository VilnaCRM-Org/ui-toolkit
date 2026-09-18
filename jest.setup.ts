import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

import { initI18n } from './src/locales';

initI18n();
expect.extend(toHaveNoViolations);
