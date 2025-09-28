import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/assets/styles/theme';

// Mock useColorScheme
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from '@/hooks/use-color-scheme';

describe('useThemeColor', () => {
  const mockedUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns light color when color scheme is light', () => {
    mockedUseColorScheme.mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );

    expect(result.current).toBe(Colors.light.text);
  });

  it('returns dark color when color scheme is dark', () => {
    mockedUseColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );

    expect(result.current).toBe(Colors.dark.text);
  });

  it('returns custom light color when provided and scheme is light', () => {
    mockedUseColorScheme.mockReturnValue('light');
    const customLight = '#FF0000';

    const { result } = renderHook(() =>
      useThemeColor({ light: customLight }, 'text')
    );

    expect(result.current).toBe(customLight);
  });

  it('returns custom dark color when provided and scheme is dark', () => {
    mockedUseColorScheme.mockReturnValue('dark');
    const customDark = '#00FF00';

    const { result } = renderHook(() =>
      useThemeColor({ dark: customDark }, 'text')
    );

    expect(result.current).toBe(customDark);
  });

  it('falls back to light theme when color scheme is null', () => {
    mockedUseColorScheme.mockReturnValue(null);

    const { result } = renderHook(() =>
      useThemeColor({}, 'background')
    );

    expect(result.current).toBe(Colors.light.background);
  });

  it('prioritizes custom colors over theme colors', () => {
    mockedUseColorScheme.mockReturnValue('light');
    const customLight = '#CUSTOM';

    const { result } = renderHook(() =>
      useThemeColor({ light: customLight, dark: '#OTHER' }, 'text')
    );

    expect(result.current).toBe(customLight);
    expect(result.current).not.toBe(Colors.light.text);
  });

  it('returns correct color for different color names', () => {
    mockedUseColorScheme.mockReturnValue('light');

    const { result: textResult } = renderHook(() =>
      useThemeColor({}, 'text')
    );
    const { result: backgroundResult } = renderHook(() =>
      useThemeColor({}, 'background')
    );
    const { result: tintResult } = renderHook(() =>
      useThemeColor({}, 'tint')
    );

    expect(textResult.current).toBe(Colors.light.text);
    expect(backgroundResult.current).toBe(Colors.light.background);
    expect(tintResult.current).toBe(Colors.light.tint);
  });
});
