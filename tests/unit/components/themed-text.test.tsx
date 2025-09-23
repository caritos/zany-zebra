import React from 'react';
import { render } from '@/tests/utils/test-utils';
import { ThemedText } from '@/components/themed-text';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

describe('ThemedText', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    const textElement = getByText('Hello World');
    expect(textElement).toBeTruthy();
  });

  it('renders with title type', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    const titleElement = getByText('Title Text');
    expect(titleElement).toBeTruthy();

    // Check if title styles are applied
    const styles = titleElement.props.style;
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 32,
          fontWeight: 'bold',
        }),
      ])
    );
  });

  it('renders with subtitle type', () => {
    const { getByText } = render(
      <ThemedText type="subtitle">Subtitle Text</ThemedText>
    );
    const subtitleElement = getByText('Subtitle Text');
    expect(subtitleElement).toBeTruthy();

    const styles = subtitleElement.props.style;
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 20,
          fontWeight: 'bold',
        }),
      ])
    );
  });

  it('renders with link type', () => {
    const { getByText } = render(
      <ThemedText type="link">Link Text</ThemedText>
    );
    const linkElement = getByText('Link Text');
    expect(linkElement).toBeTruthy();

    const styles = linkElement.props.style;
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          color: '#0a7ea4',
        }),
      ])
    );
  });

  it('renders with custom style', () => {
    const customStyle = { fontSize: 24, color: 'red' };
    const { getByText } = render(
      <ThemedText style={customStyle}>Custom Style Text</ThemedText>
    );
    const element = getByText('Custom Style Text');

    const styles = element.props.style;
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle),
      ])
    );
  });

  it('passes through additional props', () => {
    const { getByTestId } = render(
      <ThemedText testID="test-id" accessibilityLabel="Test Label">
        Test Text
      </ThemedText>
    );
    const element = getByTestId('test-id');
    expect(element).toBeTruthy();
    expect(element.props.accessibilityLabel).toBe('Test Label');
  });
});
