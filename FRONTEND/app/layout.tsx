import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "KANTARES POS - Sistema de Punto de Venta",
  description: "Sistema POS moderno para restaurante KANTARES",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthGuard>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthGuard>
        <Analytics />
      </body>
    </html>
  )
}
