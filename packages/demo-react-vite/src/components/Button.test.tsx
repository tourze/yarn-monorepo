import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByTestId('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
    expect(button).not.toBeDisabled();
  });

  it('renders correctly with custom props', () => {
    render(
      <Button
        variant="secondary"
        size="large"
        className="custom-class"
      >
        Custom Button
      </Button>
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-gray-200', 'px-6', 'custom-class');
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
