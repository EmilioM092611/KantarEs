// FRONTEND/components/providers.tsx

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Si tienes otros providers como ThemeProvider, también van aquí */}
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      {children}
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
