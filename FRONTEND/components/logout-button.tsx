"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("kantares_auth")
    localStorage.removeItem("kantares_user")
    router.push("/")
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar Sesión
    </Button>
  )
}
