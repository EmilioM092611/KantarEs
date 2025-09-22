import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { PageTransition } from "@/components/page-transition"
import { PageLoader } from "@/components/page-loader"
import "./globals.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthGuard>
          <PageTransition>
            <Suspense fallback={<PageLoader text="Cargando página..." />}>{children}</Suspense>
          </PageTransition>
        </AuthGuard>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
