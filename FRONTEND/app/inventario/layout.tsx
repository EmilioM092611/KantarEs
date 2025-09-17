import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-72 transition-all duration-300">{children}</main>
    </div>
  )
}
