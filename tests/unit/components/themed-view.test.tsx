import React from 'react';
import { Text } from 'react-native';
import { render } from '@/tests/utils/test-utils';
import { ThemedView } from '@/components/themed-view';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#FFFFFF'),
}));

describe('ThemedView', () => {
  it('renders correctly with children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Child Component</Text>
      </ThemedView>
    );
    expect(getByText('Child Component')).toBeTruthy();
  });

  it('applies backgroundColor from theme', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <Text>Content</Text>
      </ThemedView>
    );
    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#FFFFFF',
        }),
      ])
    );
  });

  it('merges custom styles with theme styles', () => {
    const customStyle = {
      padding: 20,
      borderRadius: 10,
    };

    const { getByTestId } = render(
      <ThemedView testID="styled-view" style={customStyle}>
        <Text>Styled Content</Text>
      </ThemedView>
    );

    const view = getByTestId('styled-view');
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#FFFFFF',
        }),
        expect.objectContaining(customStyle),
      ])
    );
  });

  it('passes through additional View props', () => {
    const onLayout = jest.fn();
    const { getByTestId } = render(
      <ThemedView
        testID="test-view"
        accessibilityLabel="Test View"
        onLayout={onLayout}
        pointerEvents="none"
      >
        <Text>Test</Text>
      </ThemedView>
    );

    const view = getByTestId('test-view');
    expect(view.props.accessibilityLabel).toBe('Test View');
    expect(view.props.pointerEvents).toBe('none');
  });

  it('renders multiple children correctly', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>First Child</Text>
        <Text>Second Child</Text>
        <Text>Third Child</Text>
      </ThemedView>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
    expect(getByText('Third Child')).toBeTruthy();
  });
});
