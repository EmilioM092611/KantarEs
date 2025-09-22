"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setCollapsed(event.detail.collapsed)
    }

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener)
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-72"}`}>{children}</main>
    </div>
  )
}
