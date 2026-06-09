"use client";

import { QueryClient, QueryClientProvider } from "@/lib/react-query-custom";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ActivityLogProvider } from "@/lib/activityLog";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ActivityLogProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </ActivityLogProvider>
    </QueryClientProvider>
  );
}