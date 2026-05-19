import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OperatorAvatar } from './OperatorAvatar';

describe('OperatorAvatar', () => {
  it('shows initials when no image', () => {
    render(<OperatorAvatar name="Fabricio Lasagna" />);
    expect(screen.getByText('FL')).toBeInTheDocument();
  });

  it('renders image when url provided', () => {
    render(<OperatorAvatar name="Test" imageUrl="https://cdn.example.com/logo.png" />);
    expect(document.querySelector('img')).toBeTruthy();
  });
});
