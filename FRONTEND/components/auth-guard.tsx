"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { PageLoader } from "./page-loader"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(() => {
    const auth = localStorage.getItem("kantares_auth")
    const isLoginPage = pathname === "/"

    if (!auth && !isLoginPage) {
      // Not authenticated and not on login page - redirect to login
      router.replace("/")
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    if (auth && isLoginPage) {
      // Authenticated but on login page - redirect to dashboard
      router.replace("/dashboard")
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // Set authentication state and stop loading
    setIsAuthenticated(!!auth)
    setIsLoading(false)
  }, [router, pathname])

  useEffect(() => {
    const timer = setTimeout(checkAuth, 50)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kantares_auth") {
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

    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("kantares-auth-change", handleAuthChange)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("kantares-auth-change", handleAuthChange)
    }
  }, [checkAuth])

  if (isLoading) {
    return <PageLoader text="Cargando..." />
  }

  return <>{children}</>
}
