import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button onPress={onPressMock}>Click Me</Button>);

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state correctly', () => {
    const { getByTestId } = render(
      <Button disabled testID="disabled-button">
        Disabled Button
      </Button>
    );

    const buttonElement = getByTestId('disabled-button');
    expect(buttonElement.props.accessibilityState.disabled).toBe(true);
  });
});
