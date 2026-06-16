"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// React 19 / Next.js 16 error interceptor
// next-themes injects a script to prevent theme flashing, which causes a dev warning.
// This safely filters out that specific false-positive console error in development.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: any) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}