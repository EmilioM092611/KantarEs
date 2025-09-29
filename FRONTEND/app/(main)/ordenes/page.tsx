"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Edit,
  Printer,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"

const ordersData = [
  {
    id: "ORD-001",
    mesa: "Mesa 5",
    cliente: "Juan Pérez",
    items: [
      { name: "Tacos al Pastor", quantity: 3, price: 45 },
      { name: "Agua de Horchata", quantity: 2, price: 25 },
    ],
    total: 185,
    status: "preparing",
    time: "15:30",
    waiter: "María González",
    notes: "Sin cebolla en los tacos",
  },
  {
    id: "ORD-002",
    mesa: "Mesa 12",
    cliente: "Ana López",
    items: [
      { name: "Pozole Rojo", quantity: 1, price: 85 },
      { name: "Cerveza Corona", quantity: 2, price: 35 },
    ],
    total: 155,
    status: "ready",
    time: "15:25",
    waiter: "Carlos Ruiz",
    notes: "",
  },
  {
    id: "ORD-003",
    mesa: "Mesa 3",
    cliente: "Roberto Silva",
    items: [
      { name: "Quesadillas", quantity: 2, price: 60 },
      { name: "Guacamole", quantity: 1, price: 40 },
      { name: "Refresco", quantity: 3, price: 20 },
    ],
    total: 160,
    status: "delivered",
    time: "15:20",
    waiter: "María González",
    notes: "Extra salsa verde",
  },
  {
    id: "ORD-004",
    mesa: "Mesa 8",
    cliente: "Lucía Martín",
    items: [{ name: "Café Americano", quantity: 1, price: 25 }],
    total: 25,
    status: "cancelled",
    time: "15:15",
    waiter: "Carlos Ruiz",
    notes: "Cliente canceló",
  },
]

const todayStats = {
  totalOrders: 47,
  completedOrders: 42,
  pendingOrders: 3,
  cancelledOrders: 2,
  totalRevenue: 8450,
  averageOrderValue: 180,
}

export default function OrdersPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ready":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="h-4 w-4" />
      case "ready":
        return <AlertCircle className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes</h1>
            <p className="text-gray-600">Gestión de pedidos y seguimiento de cocina</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar órdenes..."
                className="pl-10 w-80 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Órdenes Hoy",
            value: todayStats.totalOrders,
            change: "+5 vs ayer",
            changeColor: "text-green-600",
            icon: ShoppingCart,
            gradient: "from-blue-400 to-blue-600",
          },
          {
            title: "Pendientes",
            value: todayStats.pendingOrders,
            change: "En cocina",
            changeColor: "text-yellow-600",
            icon: Clock,
            gradient: "from-yellow-400 to-yellow-600",
          },
          {
            title: "Ingresos Hoy",
            value: `$${todayStats.totalRevenue.toLocaleString()}`,
            change: "+12% vs ayer",
            changeColor: "text-green-600",
            icon: DollarSign,
            gradient: "from-green-400 to-green-600",
          },
          {
            title: "Ticket Promedio",
            value: `$${todayStats.averageOrderValue}`,
            change: "+8% vs ayer",
            changeColor: "text-blue-600",
            icon: Users,
            gradient: "from-purple-400 to-purple-600",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    <p className={`${stat.changeColor} text-sm mt-2`}>{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}
                  >
                    {React.createElement(stat.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Orders List */}
      <SlideIn direction="up" delay={0.5}>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="preparing">Preparando</TabsTrigger>
            <TabsTrigger value="ready">Listas</TabsTrigger>
            <TabsTrigger value="delivered">Entregadas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {ordersData.map((order, index) => (
                <SlideIn key={order.id} direction="up" delay={0.6 + index * 0.05}>
                  <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-smooth hover:scale-105">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{order.id}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {order.mesa} • {order.time}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Cliente: {order.cliente}</p>
                        <p className="text-sm text-gray-600">Mesero: {order.waiter}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Items:</p>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Notas:</strong> {order.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total: ${order.total}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-smooth hover:scale-105 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-smooth hover:scale-105 bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="transition-smooth hover:scale-105 bg-transparent"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideIn>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preparing">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {ordersData
                .filter((order) => order.status === "preparing")
                .map((order, index) => (
                  <SlideIn key={order.id} direction="up" delay={0.1 + index * 0.05}>
                    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-smooth hover:scale-105">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">{order.id}</CardTitle>
                            <p className="text-sm text-gray-600">
                              {order.mesa} • {order.time}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </div>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Cliente: {order.cliente}</p>
                          <p className="text-sm text-gray-600">Mesero: {order.waiter}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Items:</p>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium">${item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Notas:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <span className="text-lg font-bold text-gray-900">Total: ${order.total}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="transition-smooth hover:scale-105 bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="transition-smooth hover:scale-105 bg-transparent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="transition-smooth hover:scale-105 bg-transparent"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SlideIn>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </SlideIn>
    </div>
  )
}
