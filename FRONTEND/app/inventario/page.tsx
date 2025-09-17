"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  Edit,
  Trash2,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react"

const inventoryData = [
  {
    id: 1,
    name: "Carne de Res",
    category: "Carnes",
    stock: 25,
    minStock: 10,
    unit: "kg",
    cost: 180,
    supplier: "Carnicería Central",
    lastUpdated: "2025-01-16",
    status: "normal",
  },
  {
    id: 2,
    name: "Tortillas de Maíz",
    category: "Granos",
    stock: 5,
    minStock: 20,
    unit: "paquetes",
    cost: 25,
    supplier: "Tortillería La Esperanza",
    lastUpdated: "2025-01-15",
    status: "low",
  },
  {
    id: 3,
    name: "Cerveza Corona",
    category: "Bebidas",
    stock: 120,
    minStock: 50,
    unit: "botellas",
    cost: 18,
    supplier: "Distribuidora ABC",
    lastUpdated: "2025-01-16",
    status: "normal",
  },
  {
    id: 4,
    name: "Queso Oaxaca",
    category: "Lácteos",
    stock: 2,
    minStock: 8,
    unit: "kg",
    cost: 120,
    supplier: "Lácteos del Valle",
    lastUpdated: "2025-01-14",
    status: "critical",
  },
  {
    id: 5,
    name: "Aguacate",
    category: "Verduras",
    stock: 15,
    minStock: 10,
    unit: "kg",
    cost: 45,
    supplier: "Frutas y Verduras El Campo",
    lastUpdated: "2025-01-16",
    status: "normal",
  },
]

const suppliers = [
  {
    id: 1,
    name: "Carnicería Central",
    contact: "555-0123",
    email: "ventas@carniceriacentral.com",
    products: 8,
    lastOrder: "2025-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Tortillería La Esperanza",
    contact: "555-0456",
    email: "pedidos@laesperanza.com",
    products: 3,
    lastOrder: "2025-01-14",
    status: "active",
  },
  {
    id: 3,
    name: "Distribuidora ABC",
    contact: "555-0789",
    email: "info@distribuidoraabc.com",
    products: 15,
    lastOrder: "2025-01-16",
    status: "active",
  },
]

const purchaseOrders = [
  {
    id: "PO-001",
    supplier: "Carnicería Central",
    items: 5,
    total: 2450,
    date: "2025-01-16",
    status: "pending",
  },
  {
    id: "PO-002",
    supplier: "Lácteos del Valle",
    items: 3,
    total: 890,
    date: "2025-01-15",
    status: "received",
  },
  {
    id: "PO-003",
    supplier: "Distribuidora ABC",
    items: 12,
    total: 3200,
    date: "2025-01-14",
    status: "delivered",
  },
]

export default function InventoryPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Crítico"
      case "low":
        return "Bajo"
      case "normal":
        return "Normal"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventario</h1>
          <p className="text-gray-600">Gestión de stock, proveedores y compras</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 w-80 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-300 focus:ring-red-200"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Productos</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">156</h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12 este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Stock Bajo</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">8</h3>
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Requiere atención
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Valor Total</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">$45,680</h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.2% vs mes anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Proveedores</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">24</h3>
                <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />3 nuevos este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Lista de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Costo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Proveedor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">Actualizado: {item.lastUpdated}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">{item.category}</td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {item.stock} {item.unit}
                          </div>
                          <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">${item.cost}</td>
                        <td className="py-4 px-4 text-gray-700">{item.supplier}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Proveedores</CardTitle>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">{supplier.contact}</p>
                          <p className="text-sm text-gray-600">{supplier.email}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Productos:</span>
                          <span className="font-medium">{supplier.products}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Último pedido:</span>
                          <span className="font-medium">{supplier.lastOrder}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Pedido
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Órdenes de Compra</CardTitle>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Orden</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Proveedor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{order.id}</td>
                        <td className="py-4 px-4 text-gray-700">{order.supplier}</td>
                        <td className="py-4 px-4 text-gray-700">{order.items} productos</td>
                        <td className="py-4 px-4 font-medium text-gray-900">${order.total.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-700">{order.date}</td>
                        <td className="py-4 px-4">
                          <Badge
                            className={
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : order.status === "received"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {order.status === "delivered"
                              ? "Entregado"
                              : order.status === "received"
                                ? "Recibido"
                                : "Pendiente"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
