import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { PageLoader } from "@/components/page-loader";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={<PageLoader text="Cargando aplicación..." />}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
        {/* 🎯 Toaster para notificaciones en toda la aplicación */}
        <Toaster />
      </body>
    </html>
  );
}

export const metadata = {
  title: "KantarEs",
  description: "Sistema de Gestión para Restaurantes",
};
