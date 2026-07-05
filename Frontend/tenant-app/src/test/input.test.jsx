import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@trackify/shared';

describe('shared Input', () => {
  it('renders validation error message when error prop is provided', () => {
    render(
      <Input
        id="org-name"
        label="Organization name"
        value=""
        onChange={() => {}}
        error="Organization name is required"
      />
    );

    expect(screen.getByText('Organization name is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Organization name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not render error message when error prop is absent', () => {
    render(<Input id="org-name" label="Organization name" value="" onChange={() => {}} />);

    expect(screen.queryByText('Organization name is required')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Organization name')).not.toHaveAttribute('aria-invalid');
  });
});
