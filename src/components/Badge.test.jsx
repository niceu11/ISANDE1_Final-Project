import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('renders the default label for a known variant', () => {
    render(<Badge variant="hot" />);
    expect(screen.getByText('Hot')).toHaveClass('badge', 'badge-hot');
  });

  it('overrides the label when one is provided', () => {
    render(<Badge variant="confirmed" label="Locked In" />);
    expect(screen.getByText('Locked In')).toHaveClass('badge-confirmed');
  });

  it('falls back to a pending style for an unknown variant', () => {
    render(<Badge variant="mystery" />);
    expect(screen.getByText('mystery')).toHaveClass('badge-pending');
  });
});
