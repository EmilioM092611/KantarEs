"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, Search, Filter, AlertTriangle, TrendingUp, BarChart3, Archive } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

export default function StockPage() {
  const [inventory] = useState([
    {
      id: 1,
      name: "Pollo a la Parrilla",
      category: "Carnes",
      stock: 25,
      minStock: 10,
      unit: "kg",
      cost: 120.0,
      status: "Normal",
    },
    {
      id: 2,
      name: "Tomate Cherry",
      category: "Verduras",
      stock: 5,
      minStock: 15,
      unit: "kg",
      cost: 45.0,
      status: "Bajo",
    },
    {
      id: 3,
      name: "Queso Manchego",
      category: "Lácteos",
      stock: 8,
      minStock: 5,
      unit: "kg",
      cost: 280.0,
      status: "Normal",
    },
    {
      id: 4,
      name: "Aceite de Oliva",
      category: "Condimentos",
      stock: 2,
      minStock: 8,
      unit: "L",
      cost: 150.0,
      status: "Crítico",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-700"
      case "Bajo":
        return "bg-yellow-100 text-yellow-700"
      case "Crítico":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const lowStockItems = inventory.filter((item) => item.status !== "Normal").length
  const totalValue = inventory.reduce((sum, item) => sum + item.stock * item.cost, 0)

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Stock</h1>
            <p className="text-gray-600 mt-1">Monitorea y gestiona el inventario en tiempo real</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 transition-smooth hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
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
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
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
                    <p className="text-sm font-medium text-gray-600">Categorías</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Archive className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.6}>
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inventario Actual</CardTitle>
                      <CardDescription>Estado actual de todos los productos en stock</CardDescription>
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
                    {inventory.map((item, index) => (
                      <SlideIn key={item.id} direction="up" delay={0.8 + index * 0.1}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-smooth hover:scale-[1.02]">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              <p className="text-xs text-gray-500">
                                Mín: {item.minStock} {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.stock} {item.unit}
                            </p>
                            <p className="text-xs text-gray-500">${item.cost.toFixed(2)} c/u</p>
                          </div>
                        </div>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Movimientos de Inventario</CardTitle>
                  <CardDescription>Historial de entradas y salidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Historial de movimientos en desarrollo</p>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Alertas de Stock</CardTitle>
                  <CardDescription>Productos que requieren atención</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventory
                      .filter((item) => item.status !== "Normal")
                      .map((item, index) => (
                        <SlideIn key={item.id} direction="up" delay={0.8 + index * 0.1}>
                          <div className="flex items-center justify-between p-4 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <div>
                                <h4 className="font-medium text-red-900">{item.name}</h4>
                                <p className="text-sm text-red-700">
                                  Stock actual: {item.stock} {item.unit}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                        </SlideIn>
                      ))}
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
