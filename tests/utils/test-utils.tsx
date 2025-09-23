import React from "react";
import { render as rtlRender } from "@testing-library/react-native";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";

// Custom render function that includes providers
function render(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// re-export everything
export * from "@testing-library/react-native";

// override render method
export { render };
