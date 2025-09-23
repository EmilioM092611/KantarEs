"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NotificationsPanel } from "@/components/notifications-panel"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import { usePageTransition } from "@/hooks/use-page-transition"
import { useState, useMemo, useCallback } from "react"
import {
  Users,
  DollarSign,
  ShoppingCart,
  Search,
  Bell,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Utensils,
  Package,
  BarChart3,
  MapPin,
  UserCheck,
  Settings,
  Tag,
  Menu,
  ShoppingBag,
} from "lucide-react"

const metricsData = [
  {
    title: "Mesas Ocupadas",
    value: "12/20",
    change: "↑ 60% ocupación",
    changeType: "positive",
    icon: Users,
    color: "from-blue-400 to-blue-600",
    progress: 60,
  },
  {
    title: "Pedidos Hoy",
    value: "47",
    change: "↑ 12.5% vs ayer",
    changeType: "positive",
    icon: ShoppingCart,
    color: "from-green-400 to-green-600",
    progress: 85,
  },
  {
    title: "Ventas Hoy",
    value: "MXN$2,340",
    change: "↓ 3% vs ayer",
    changeType: "negative",
    icon: DollarSign,
    color: "from-purple-400 to-purple-600",
    progress: 70,
  },
  {
    title: "Personal Activo",
    value: "8",
    change: "↑ 8.2% vs ayer",
    changeType: "positive",
    icon: UserCheck,
    color: "from-orange-400 to-orange-600",
    progress: 75,
  },
]

const modulesSections = [
    {
    title: "Servicio",
    modules: [
      {
        title: "Mesas",
        description: "Gestión de mesas y reservas",
        icon: Utensils,
        color: "from-red-500 to-orange-500",
        category: "Servicio",
        href: "/mesas",
      },
      {
        title: "Ordenes",
        description: "Ordenes de clientes",
        icon: ShoppingCart,
        color: "from-orange-500 to-yellow-500",
        category: "Servicio",
        href: "/ordenes",
      },
    ],
  },
  {
    title: "Productos",
    modules: [
      {
        title: "Productos",
        description: "Productos en el sistema",
        icon: Package,
        color: "from-blue-500 to-blue-600",
        category: "Productos",
        href: "/productos",
      },
      {
        title: "Menu",
        description: "Gestión de artículos",
        icon: Menu,
        color: "from-purple-500 to-purple-600",
        category: "Productos",
        href: "/productos",
      },
      {
        title: "Promociones",
        description: "Ofertas y descuentos",
        icon: Tag,
        color: "from-pink-500 to-red-500",
        category: "Productos",
        href: "/promociones",
      },
    ],
  },
  {
    title: "Inventario",
    modules: [
      {
        title: "Compras",
        description: "Gestión de compras",
        icon: ShoppingBag,
        color: "from-teal-500 to-green-500",
        category: "Inventario",
        href: "/inventario",
      },
      {
        title: "Inventario",
        description: "Control de inventario",
        icon: Package,
        color: "from-blue-500 to-blue-600",
        category: "Inventario",
        href: "/inventario",
      },
    ],
  },
  {
    title: "Finanzas",
    modules: [
      {
        title: "Cortes de caja",
        description: "Gestión financiera",
        icon: DollarSign,
        color: "from-green-500 to-green-600",
        category: "Finanzas",
        href: "/finanzas/cortes",
      },
      {
        title: "Estadísticas",
        description: "Control de efectivo",
        icon: BarChart3,
        color: "from-orange-500 to-yellow-500",
        category: "Finanzas",
        href: "/finanzas/analisis",
      },
    ],
  },
  {
    title: "Configuración",
    modules: [
      {
        title: "Areas",
        description: "Zonas del restaurante",
        icon: MapPin,
        color: "from-blue-500 to-cyan-500",
        category: "Configuración",
        href: "/configuracion/areas",
      },
      {
        title: "Impresoras",
        description: "Configuración de impresión",
        icon: Settings,
        color: "from-slate-500 to-gray-600",
        category: "Configuración",
        href: "/configuracion/impresoras",
      },
      {
        title: "Sistema",
        description: "Configuración general",
        icon: Settings,
        color: "from-gray-500 to-slate-600",
        category: "Configuración",
        href: "/configuracion/sistema",
      },
    ],
  },
  {
    title: "Administración de personal",
    modules: [
      {
        title: "Usuarios",
        description: "Gestión de personal",
        icon: Users,
        color: "from-purple-500 to-purple-600",
        category: "Administración",
        href: "/administracion/usuarios",
      },
    ],
  },
]

const recentOrders = [
  { mesa: "Mesa 5", items: "3 items", total: "$1,250", tiempo: "5 min", estado: "preparando" },
  { mesa: "Mesa 12", items: "2 items", total: "$890", tiempo: "12 min", estado: "listo" },
  { mesa: "Mesa 3", items: "4 items", total: "$1,680", tiempo: "8 min", estado: "preparando" },
  { mesa: "Mesa 8", items: "1 item", total: "$450", tiempo: "15 min", estado: "entregado" },
]

const popularProducts = [
  { nombre: "Tacos al Pastor", vendidos: 45, ingresos: "$2,250" },
  { nombre: "Quesadillas", vendidos: 32, ingresos: "$1,920" },
  { nombre: "Pozole Rojo", vendidos: 28, ingresos: "$1,680" },
  { nombre: "Enchiladas Verdes", vendidos: 24, ingresos: "$1,440" },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { navigateWithTransition, isTransitioning } = usePageTransition()

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const filteredModulesSections = useMemo(() => {
    if (!searchTerm) return modulesSections

    return modulesSections
      .map((section) => ({
        ...section,
        modules: section.modules.filter(
          (module) =>
            module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter((section) => section.modules.length > 0)
  }, [searchTerm])

  const handleModuleClick = useCallback(
    (href: string) => {
      navigateWithTransition(href)
    },
    [navigateWithTransition],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Hola, Usuario 👋</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm capitalize">{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{currentTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-72 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            <NotificationsPanel>
              <Button variant="outline" size="icon" className="relative bg-transparent hover:bg-red-50 border-red-200">
                <Bell className="h-4 w-4 text-red-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </NotificationsPanel>
          </div>
        </div>
      </FadeIn>

      {/* Banner Section */}
      <SlideIn direction="up" delay={0.1}>
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: 'url("/kantares-logo.jpg")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
        </div>
      </SlideIn>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{metric.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</h3>
                    <p
                      className={`text-sm mt-3 flex items-center gap-1 ${
                        metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.changeType === "positive" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {metric.change}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${metric.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${metric.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Loading overlay cuando se hace click en un módulo */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
              <span className="text-gray-700 font-medium">Cargando módulo...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modules Sections */}
      {filteredModulesSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <SlideIn direction="left" delay={0.1 + sectionIndex * 0.05}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{section.title}</h2>
          </SlideIn>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {section.modules.map((module, index) => (
              <SlideIn key={index} direction="up" delay={0.2 + index * 0.1}>
                <Card
                  className={`bg-gradient-to-br ${module.color} border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden text-white`}
                  onClick={() => handleModuleClick(module.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/30">
                        <module.icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-black/30 text-white border-black/20 backdrop-blur-sm"
                      >
                        {module.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-3 text-xl">{module.title}</h3>
                    <p className="text-white/90 text-sm mb-4">{module.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              </SlideIn>
            ))}
          </div>
        </div>
      ))}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SlideIn direction="left" delay={0.3}>
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Órdenes Recientes</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.map((orden, index) => (
                <FadeIn key={index} delay={0.4 + index * 0.1}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Utensils className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{orden.mesa}</p>
                        <p className="text-sm text-gray-500">
                          {orden.items} • {orden.tiempo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{orden.total}</p>
                      <Badge
                        variant={
                          orden.estado === "listo" ? "default" : orden.estado === "preparando" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {orden.estado}
                      </Badge>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn direction="right" delay={0.3}>
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Productos Populares</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularProducts.map((producto, index) => (
                <FadeIn key={index} delay={0.4 + index * 0.1}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">{producto.vendidos} vendidos</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{producto.ingresos}</p>
                  </div>
                </FadeIn>
              ))}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </div>
  )
}
