import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthSkeleton } from '../../src/components';

describe('AuthSkeleton', () => {
  it('renders the form-loading skeleton region', () => {
    render(<AuthSkeleton />);

    expect(screen.getByLabelText('Loading form')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('supports a custom aria label', () => {
    render(<AuthSkeleton ariaLabel="Authentication loading" />);

    expect(screen.getByLabelText('Authentication loading')).toBeInTheDocument();
  });
});
