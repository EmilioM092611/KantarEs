"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("kantares_auth")
      const isLoginPage = pathname === "/"

      console.log("[v0] Auth check:", { auth, isLoginPage, pathname })

      if (!auth && !isLoginPage) {
        // Not authenticated and not on login page - redirect to login
        console.log("[v0] Redirecting to login - not authenticated")
        router.replace("/")
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      if (auth && isLoginPage) {
        // Authenticated but on login page - redirect to dashboard
        console.log("[v0] Redirecting to dashboard - already authenticated")
        router.replace("/dashboard")
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // Set authentication state and stop loading
      setIsAuthenticated(!!auth)
      setIsLoading(false)
      console.log("[v0] Auth state set:", !!auth)
    }

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kantares_auth") {
        console.log("[v0] Storage change detected:", e.newValue)
        if (!e.newValue) {
          // Auth was removed, redirect to login
          setIsAuthenticated(false)
          router.replace("/")
        } else {
          // Auth was added
          setIsAuthenticated(true)
          if (pathname === "/") {
            router.replace("/dashboard")
          }
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [router, pathname])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-red-100 to-red-600">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="text-red-700 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
