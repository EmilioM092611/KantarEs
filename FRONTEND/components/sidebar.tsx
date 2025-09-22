"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Tag,
  Warehouse,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Building2,
  MapPin,
  Printer,
} from "lucide-react"

const menuSections = [
  {
    title: "Dashboard",
    items: [{ icon: Home, label: "Inicio", href: "/dashboard" }],
  },
  {
    title: "Servicio",
    items: [
      { icon: Users, label: "Mesas", href: "/mesas" },
      { icon: ShoppingCart, label: "Órdenes", href: "/ordenes" },
    ],
  },
  {
    title: "Productos",
    items: [
      { icon: Package, label: "Menú", href: "/productos" },
      { icon: Tag, label: "Promociones", href: "/promociones" },
      { icon: Warehouse, label: "Inventario", href: "/inventario" },
      { icon: ShoppingCart, label: "Compras", href: "/inventario/compras" },
      { icon: Building2, label: "Proveedores", href: "/inventario/proveedores" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { icon: DollarSign, label: "Cortes", href: "/finanzas/cortes" },
      { icon: TrendingUp, label: "Estadísticas", href: "/finanzas/analisis" },
      { icon: FileText, label: "Reportes", href: "/finanzas/reportes" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { icon: UserCog, label: "Usuarios", href: "/configuracion/usuarios" },
      { icon: Settings, label: "Sistema", href: "/configuracion/sistema" },
      { icon: MapPin, label: "Áreas", href: "/configuracion/areas" },
      { icon: Printer, label: "Impresoras", href: "/configuracion/impresoras" },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)

    // Dispatch custom event to notify layout
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", {
        detail: { collapsed: newCollapsed },
      }),
    )
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen !bg-red-700 bg-gradient-to-b from-red-600 via-red-700 to-red-900 transition-all duration-300 shadow-2xl flex flex-col",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-red-500/30 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold !text-white">KANTARES</h1>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-9 w-9 p-0 !text-white hover:bg-white/20">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-red-400/60 scrollbar-track-transparent hover:scrollbar-thumb-red-300/80 transition-colors">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <h3 className="px-4 mb-3 text-xs font-semibold !text-red-100 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <nav className="space-y-2 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "w-full flex items-center gap-3 h-12 px-4 rounded-xl transition-all cursor-pointer group",
                          isActive
                            ? "!bg-red-800 !text-white shadow-lg border border-red-600"
                            : "hover:bg-white/10 !text-red-100 hover:!text-white hover:shadow-md",
                          collapsed && "justify-center",
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-red-500/30 p-4 flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="!bg-red-800 !text-white text-sm font-semibold border border-red-600">
              KE
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium !text-white truncate">KantarEs</p>
              <p className="text-xs !text-red-100 truncate">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
