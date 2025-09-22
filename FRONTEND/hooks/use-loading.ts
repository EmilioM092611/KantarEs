"use client"

import { useState, useCallback } from "react"

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(
    async (asyncFn) => {
      startLoading()
      try {
        const result = await asyncFn()
        return result
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading],
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}
