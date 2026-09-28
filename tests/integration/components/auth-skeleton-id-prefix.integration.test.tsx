import { render } from '@testing-library/react';
import React from 'react';

import AuthSkeleton from '../../../src/components/auth-skeleton';

describe('AuthSkeleton idPrefix (integration)', () => {
  it('renders the bare ids across the composed shapes', () => {
    const { container } = render(<AuthSkeleton idPrefix="" disableAnimation />);
    ['auth-skeleton-title', 'auth-skeleton-input-3', 'auth-skeleton-divider'].forEach(id => {
      // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
      expect(container.querySelector(`[id="${id}"]`)).not.toBeNull();
    });
  });
});
