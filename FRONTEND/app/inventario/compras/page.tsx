"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

export default function ComprasPage() {
  const [purchases] = useState([
    {
      id: "PO-001",
      supplier: "Distribuidora Central",
      date: "2024-12-15",
      status: "Entregado",
      total: 2450.0,
      items: 8,
    },
    {
      id: "PO-002",
      supplier: "Carnes Premium",
      date: "2024-12-14",
      status: "Pendiente",
      total: 1890.5,
      items: 5,
    },
    {
      id: "PO-003",
      supplier: "Verduras Frescas SA",
      date: "2024-12-13",
      status: "En Tránsito",
      total: 980.75,
      items: 12,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
        return "bg-green-100 text-green-700"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700"
      case "En Tránsito":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Entregado":
        return <CheckCircle className="w-4 h-4" />
      case "Pendiente":
        return <Clock className="w-4 h-4" />
      case "En Tránsito":
        return <Truck className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
            <p className="text-gray-600 mt-1">Administra órdenes de compra y proveedores</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 transition-smooth hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden de Compra
          </Button>
        </div>
      </FadeIn>

      <SlideIn direction="up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SlideIn direction="up" delay={0.2}>
            <Card className="transition-smooth hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Órdenes Activas</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn direction="up" delay={0.3}>
            <Card className="transition-smooth hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total del Mes</p>
                    <p className="text-2xl font-bold text-gray-900">$45,320</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn direction="up" delay={0.4}>
            <Card className="transition-smooth hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Proveedores</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn direction="up" delay={0.5}>
            <Card className="transition-smooth hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Tránsito</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Truck className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.6}>
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Órdenes de Compra</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Órdenes de Compra</CardTitle>
                      <CardDescription>Historial y estado de todas las órdenes</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchases.map((purchase, index) => (
                      <SlideIn key={purchase.id} direction="up" delay={0.8 + index * 0.1}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-smooth hover:scale-[1.02]">
                          <div className="flex items-center space-x-4">
                            <div className="bg-teal-100 p-2 rounded-lg">
                              <ShoppingCart className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{purchase.id}</h4>
                              <p className="text-sm text-gray-600">{purchase.supplier}</p>
                              <p className="text-xs text-gray-500">{purchase.items} artículos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(purchase.status)}>
                                {getStatusIcon(purchase.status)}
                                <span className="ml-1">{purchase.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900">${purchase.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{purchase.date}</p>
                          </div>
                        </div>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Proveedores</CardTitle>
                  <CardDescription>Gestiona tu red de proveedores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Funcionalidad de proveedores en desarrollo</p>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Reportes de Compras</CardTitle>
                  <CardDescription>Análisis y estadísticas de compras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Reportes de compras en desarrollo</p>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>
        </Tabs>
      </SlideIn>
    </div>
  )
}
