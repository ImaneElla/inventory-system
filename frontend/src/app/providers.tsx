"use client";

import { QueryClient, QueryClientProvider } from "@/lib/react-query-custom";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ActivityLogProvider } from "@/lib/activityLog";
import { AppPrefsProvider } from "@/lib/appPrefs";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (typeof window !== "undefined" && sessionStorage.getItem("auth") !== "true") {
    const localAuth = localStorage.getItem("auth") === "true";
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    if (localAuth && rememberMe) {
      const keys = ["auth", "userId", "email", "userName", "role", "userImage", "rememberMe"];
      keys.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          sessionStorage.setItem(key, val);
        }
      });
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ActivityLogProvider>
        <AppPrefsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AppPrefsProvider>
      </ActivityLogProvider>
    </QueryClientProvider>
  );
}