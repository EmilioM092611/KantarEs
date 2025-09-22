"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const navigateWithTransition = async (path: string) => {
    setIsTransitioning(true)

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150))

    router.push(path)

    // Reset transition state after navigation
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  return {
    isTransitioning,
    navigateWithTransition,
  }
}
