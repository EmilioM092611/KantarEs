"use client";

import { AuthProvider } from "@/contexts/AuthContext";
// Si usas un LoadingProvider global, también puedes envolver aquí.
// import { LoadingProvider } from "@/contexts/LoadingContext";
// import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* <LoadingProvider> */}
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      {children}
      {/* </ThemeProvider> */}
      {/* </LoadingProvider> */}
    </AuthProvider>
  );
}
