/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Australian Open inspired color palette
const aoNavyBlue = '#003366';      // Deep navy blue (primary)
const aoElectricBlue = '#00B4D8';  // Electric blue (accent)
const aoLightBlue = '#90E0EF';     // Light blue (highlights)
const aoWhite = '#FFFFFF';         // Pure white
const aoLightGray = '#F8F9FA';     // Light background
const aoMediumGray = '#6C757D';    // Medium gray for icons/text
const aoDarkGray = '#343A40';      // Dark gray for text

const tintColorLight = aoElectricBlue;
const tintColorDark = aoLightBlue;

export const Colors = {
  light: {
    text: aoDarkGray,
    background: aoWhite,
    tint: tintColorLight,
    icon: aoMediumGray,
    tabIconDefault: aoMediumGray,
    tabIconSelected: tintColorLight,
    // Australian Open specific colors
    primary: aoNavyBlue,
    secondary: aoElectricBlue,
    accent: aoLightBlue,
    surface: aoLightGray,
  },
  dark: {
    text: aoWhite,
    background: aoNavyBlue,
    tint: tintColorDark,
    icon: aoLightBlue,
    tabIconDefault: aoLightBlue,
    tabIconSelected: aoWhite,
    // Australian Open specific colors (adjusted for dark mode)
    primary: aoElectricBlue,
    secondary: aoLightBlue,
    accent: aoElectricBlue,
    surface: '#001122',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
