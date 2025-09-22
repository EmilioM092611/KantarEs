"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  ShoppingCart,
  Users,
  DollarSign,
  MoreHorizontal,
  Eye,
  Archive,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  Star,
  Warehouse,
} from "lucide-react"

interface InventoryItem {
  id: number
  name: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
  cost: number
  supplier: string
  lastUpdated: string
  status: "critical" | "low" | "normal" | "overstocked"
  location: string
  barcode?: string
  expiryDate?: string
  notes?: string
}

interface Supplier {
  id: number
  name: string
  contact: string
  email: string
  address: string
  products: number
  lastOrder: string
  status: "active" | "inactive"
  rating: number
  paymentTerms: string
}

interface PurchaseOrder {
  id: string
  supplier: string
  items: number
  total: number
  date: string
  expectedDate: string
  status: "pending" | "approved" | "received" | "delivered" | "cancelled"
  priority: "low" | "medium" | "high"
}

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: "Carne de Res Premium",
    category: "Carnes",
    stock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "kg",
    cost: 180,
    supplier: "Carnicería Central",
    lastUpdated: "2025-01-16",
    status: "normal",
    location: "Refrigerador A1",
    barcode: "7501234567890",
    expiryDate: "2025-01-20",
    notes: "Corte especial para arrachera",
  },
  {
    id: 2,
    name: "Tortillas de Maíz Artesanales",
    category: "Granos",
    stock: 5,
    minStock: 20,
    maxStock: 100,
    unit: "paquetes",
    cost: 25,
    supplier: "Tortillería La Esperanza",
    lastUpdated: "2025-01-15",
    status: "critical",
    location: "Almacén B2",
    barcode: "7501234567891",
    notes: "Tortillas frescas diarias",
  },
  {
    id: 3,
    name: "Cerveza Corona Extra",
    category: "Bebidas",
    stock: 120,
    minStock: 50,
    maxStock: 200,
    unit: "botellas",
    cost: 18,
    supplier: "Distribuidora ABC",
    lastUpdated: "2025-01-16",
    status: "normal",
    location: "Bodega C1",
    barcode: "7501234567892",
    expiryDate: "2025-06-15",
  },
  {
    id: 4,
    name: "Queso Oaxaca Artesanal",
    category: "Lácteos",
    stock: 2,
    minStock: 8,
    maxStock: 25,
    unit: "kg",
    cost: 120,
    supplier: "Lácteos del Valle",
    lastUpdated: "2025-01-14",
    status: "critical",
    location: "Refrigerador A2",
    barcode: "7501234567893",
    expiryDate: "2025-01-18",
    notes: "Queso fresco para quesadillas",
  },
  {
    id: 5,
    name: "Aguacate Hass",
    category: "Verduras",
    stock: 15,
    minStock: 10,
    maxStock: 30,
    unit: "kg",
    cost: 45,
    supplier: "Frutas y Verduras El Campo",
    lastUpdated: "2025-01-16",
    status: "normal",
    location: "Almacén Fresco",
    barcode: "7501234567894",
    expiryDate: "2025-01-19",
    notes: "Para guacamole fresco",
  },
  {
    id: 6,
    name: "Chile Chipotle Seco",
    category: "Especias",
    stock: 8,
    minStock: 5,
    maxStock: 15,
    unit: "kg",
    cost: 85,
    supplier: "Especias Mexicanas SA",
    lastUpdated: "2025-01-15",
    status: "normal",
    location: "Almacén Seco D1",
    barcode: "7501234567895",
  },
]

const suppliersData: Supplier[] = [
  {
    id: 1,
    name: "Carnicería Central",
    contact: "555-0123",
    email: "ventas@carniceriacentral.com",
    address: "Av. Central 123, Col. Centro",
    products: 8,
    lastOrder: "2025-01-15",
    status: "active",
    rating: 4.8,
    paymentTerms: "30 días",
  },
  {
    id: 2,
    name: "Tortillería La Esperanza",
    contact: "555-0456",
    email: "pedidos@laesperanza.com",
    address: "Calle Morelos 456, Col. Centro",
    products: 3,
    lastOrder: "2025-01-14",
    status: "active",
    rating: 4.5,
    paymentTerms: "15 días",
  },
  {
    id: 3,
    name: "Distribuidora ABC",
    contact: "555-0789",
    email: "info@distribuidoraabc.com",
    address: "Blvd. Industrial 789, Col. Industrial",
    products: 15,
    lastOrder: "2025-01-16",
    status: "active",
    rating: 4.2,
    paymentTerms: "45 días",
  },
  {
    id: 4,
    name: "Lácteos del Valle",
    contact: "555-0321",
    email: "ventas@lacteosdelValle.com",
    address: "Carretera Valle 321, Col. Rural",
    products: 6,
    lastOrder: "2025-01-13",
    status: "active",
    rating: 4.7,
    paymentTerms: "20 días",
  },
]

const purchaseOrdersData: PurchaseOrder[] = [
  {
    id: "PO-001",
    supplier: "Carnicería Central",
    items: 5,
    total: 2450,
    date: "2025-01-16",
    expectedDate: "2025-01-18",
    status: "approved",
    priority: "high",
  },
  {
    id: "PO-002",
    supplier: "Lácteos del Valle",
    items: 3,
    total: 890,
    date: "2025-01-15",
    expectedDate: "2025-01-17",
    status: "received",
    priority: "medium",
  },
  {
    id: "PO-003",
    supplier: "Distribuidora ABC",
    items: 12,
    total: 3200,
    date: "2025-01-14",
    expectedDate: "2025-01-16",
    status: "delivered",
    priority: "low",
  },
  {
    id: "PO-004",
    supplier: "Tortillería La Esperanza",
    items: 2,
    total: 500,
    date: "2025-01-16",
    expectedDate: "2025-01-17",
    status: "pending",
    priority: "high",
  },
]

const categories = ["Carnes", "Granos", "Bebidas", "Lácteos", "Verduras", "Especias", "Condimentos", "Postres"]
const units = ["kg", "paquetes", "botellas", "latas", "piezas", "litros", "gramos"]
const locations = [
  "Refrigerador A1",
  "Refrigerador A2",
  "Almacén B1",
  "Almacén B2",
  "Bodega C1",
  "Almacén Seco D1",
  "Almacén Fresco",
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData)
  const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersData)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrdersData)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)

  // Filter functions
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Statistics
  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter((item) => item.status === "critical" || item.status === "low").length,
    totalValue: inventory.reduce((sum, item) => sum + item.cost * item.stock, 0),
    activeSuppliers: suppliers.filter((s) => s.status === "active").length,
    pendingOrders: purchaseOrders.filter((order) => order.status === "pending" || order.status === "approved").length,
    criticalItems: inventory.filter((item) => item.status === "critical").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "overstocked":
        return "bg-blue-100 text-blue-800 border-blue-200"
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
      case "overstocked":
        return "Exceso"
      default:
        return "Desconocido"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "received":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // CRUD Operations
  const openItemModal = (item?: InventoryItem) => {
    setEditingItem(item || null)
    setItemModalOpen(true)
  }

  const openSupplierModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null)
    setSupplierModalOpen(true)
  }

  const openOrderModal = (order?: PurchaseOrder) => {
    setEditingOrder(order || null)
    setOrderModalOpen(true)
  }

  const deleteItem = (id: number) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const deleteSupplier = (id: number) => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== id))
  }

  const updateOrderStatus = (orderId: string, newStatus: PurchaseOrder["status"]) => {
    setPurchaseOrders((orders) =>
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Enhanced Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-black to-neutral-900 bg-clip-text text-transparent">
              Control de inventario
            </h1>

            <p className="text-gray-600 mt-2 text-lg">Gestión completa de stock, proveedores y compras</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar productos, proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-80 h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 h-12">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-12">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="low">Bajo</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="overstocked">Exceso</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-12 w-12 transition-all hover:scale-105 bg-transparent">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Total Productos",
            value: stats.totalProducts.toString(),
            change: "+12 este mes",
            changeColor: "text-green-600",
            icon: Package,
            gradient: "from-blue-500 to-blue-600",
          },
          {
            title: "Stock Crítico",
            value: stats.criticalItems.toString(),
            change: "Requiere atención",
            changeColor: "text-red-600",
            icon: AlertTriangle,
            gradient: "from-red-500 to-red-600",
          },
          {
            title: "Stock Bajo",
            value: stats.lowStock.toString(),
            change: "Reabastecer pronto",
            changeColor: "text-yellow-600",
            icon: Archive,
            gradient: "from-yellow-500 to-yellow-600",
          },
          {
            title: "Valor Total",
            value: `$${stats.totalValue.toLocaleString()}`,
            change: "+5.2% vs mes anterior",
            changeColor: "text-green-600",
            icon: DollarSign,
            gradient: "from-green-500 to-green-600",
          },
          {
            title: "Proveedores",
            value: stats.activeSuppliers.toString(),
            change: "3 nuevos este mes",
            changeColor: "text-blue-600",
            icon: Users,
            gradient: "from-purple-500 to-purple-600",
          },
          {
            title: "Órdenes Pendientes",
            value: stats.pendingOrders.toString(),
            change: "En proceso",
            changeColor: "text-orange-600",
            icon: Truck,
            gradient: "from-orange-500 to-orange-600",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className="bg-white shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    <p className={`${stat.changeColor} text-xs mt-1 flex items-center gap-1`}>
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center`}
                  >
                    {React.createElement(stat.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Enhanced Main Content Tabs */}
      <SlideIn direction="up" delay={0.5}>
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="inventory" className="text-base">
              <Package className="h-4 w-4 mr-2" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-base">
              <Users className="h-4 w-4 mr-2" />
              Proveedores
            </TabsTrigger>
            <TabsTrigger value="purchases" className="text-base">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Compras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-red-600" />
                    Lista de Productos ({filteredInventory.length})
                  </CardTitle>
                  <Button
                    onClick={() => openItemModal()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Producto</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Categoría</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Stock</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Estado</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Costo</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Ubicación</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">
                                  {item.barcode && `Código: ${item.barcode}`}
                                  {item.expiryDate && ` • Vence: ${item.expiryDate}`}
                                </div>
                                {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="bg-gray-50">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {item.stock} {item.unit}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Min: {item.minStock} • Max: {item.maxStock}
                                </div>
                                {/* Stock Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      item.status === "critical"
                                        ? "bg-red-500"
                                        : item.status === "low"
                                          ? "bg-yellow-500"
                                          : item.status === "overstocked"
                                            ? "bg-blue-500"
                                            : "bg-green-500"
                                    }`}
                                    style={{
                                      width: `${Math.min((item.stock / item.maxStock) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-gray-900">${item.cost}</div>
                                <div className="text-sm text-gray-500">
                                  Total: ${(item.cost * item.stock).toLocaleString()}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-700">{item.location}</div>
                              <div className="text-xs text-gray-500">{item.supplier}</div>
                            </td>
                            <td className="py-4 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openItemModal(item)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Actualizar Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Proveedores ({suppliers.length})
                  </CardTitle>
                  <Button
                    onClick={() => openSupplierModal()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier, index) => (
                      <SlideIn key={supplier.id} direction="up" delay={0.2 + index * 0.1}>
                        <Card className="border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                                  {supplier.name}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>{supplier.contact}</p>
                                  <p>{supplier.email}</p>
                                  <p className="text-xs">{supplier.address}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge
                                  className={
                                    supplier.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {supplier.status === "active" ? "Activo" : "Inactivo"}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-semibold">{supplier.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Productos:</span>
                                <span className="font-semibold">{supplier.products}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Último pedido:</span>
                                <span className="font-semibold">{supplier.lastOrder}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Términos pago:</span>
                                <span className="font-semibold">{supplier.paymentTerms}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 transition-all hover:scale-105 bg-transparent"
                                onClick={() => openSupplierModal(supplier)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 transition-all hover:scale-105 bg-transparent"
                                onClick={() => openOrderModal()}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Pedido
                              </Button>
                            </div>

                            <div className="flex justify-center mt-3 pt-3 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSupplier(supplier.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-red-600" />
                    Órdenes de Compra ({purchaseOrders.length})
                  </CardTitle>
                  <Button
                    onClick={() => openOrderModal()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Orden
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Orden</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Proveedor</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Items</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Total</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Fechas</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Estado</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders.map((order, index) => (
                          <tr
                            key={order.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-gray-900">{order.id}</div>
                                <Badge className={`${getPriorityColor(order.priority)} text-xs mt-1`}>
                                  {order.priority.toUpperCase()}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-700 font-medium">{order.supplier}</td>
                            <td className="py-4 px-4 text-gray-700">{order.items} productos</td>
                            <td className="py-4 px-4 font-semibold text-gray-900">${order.total.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="text-gray-700">Pedido: {order.date}</div>
                                <div className="text-gray-500">Esperado: {order.expectedDate}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-2">
                                <Badge className={getOrderStatusColor(order.status)}>
                                  {order.status === "pending"
                                    ? "Pendiente"
                                    : order.status === "approved"
                                      ? "Aprobado"
                                      : order.status === "received"
                                        ? "Recibido"
                                        : order.status === "delivered"
                                          ? "Entregado"
                                          : "Cancelado"}
                                </Badge>
                                {(order.status === "pending" || order.status === "approved") && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1 h-6 bg-transparent"
                                      onClick={() => updateOrderStatus(order.id, "approved")}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs px-2 py-1 h-6 text-red-600 bg-transparent"
                                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openOrderModal(order)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar PDF
                                  </DropdownMenuItem>
                                  {order.status === "approved" && (
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "received")}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marcar Recibido
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>
        </Tabs>
      </SlideIn>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingItem ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del producto</Label>
                <Input id="name" defaultValue={editingItem?.name} />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select defaultValue={editingItem?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock">Stock actual</Label>
                <Input id="stock" type="number" defaultValue={editingItem?.stock} />
              </div>
              <div>
                <Label htmlFor="minStock">Stock mínimo</Label>
                <Input id="minStock" type="number" defaultValue={editingItem?.minStock} />
              </div>
              <div>
                <Label htmlFor="maxStock">Stock máximo</Label>
                <Input id="maxStock" type="number" defaultValue={editingItem?.maxStock} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unidad</Label>
                <Select defaultValue={editingItem?.unit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost">Costo unitario</Label>
                <Input id="cost" type="number" step="0.01" defaultValue={editingItem?.cost} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Select defaultValue={editingItem?.location}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Select defaultValue={editingItem?.supplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Código de barras (opcional)</Label>
                <Input id="barcode" defaultValue={editingItem?.barcode} />
              </div>
              <div>
                <Label htmlFor="expiryDate">Fecha de vencimiento (opcional)</Label>
                <Input id="expiryDate" type="date" defaultValue={editingItem?.expiryDate} />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea id="notes" defaultValue={editingItem?.notes} rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setItemModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                {editingItem ? "Actualizar" : "Crear"} Producto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Modal */}
      <Dialog open={supplierModalOpen} onOpenChange={setSupplierModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="supplierName">Nombre del proveedor</Label>
              <Input id="supplierName" defaultValue={editingSupplier?.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Teléfono</Label>
                <Input id="contact" defaultValue={editingSupplier?.contact} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={editingSupplier?.email} />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea id="address" defaultValue={editingSupplier?.address} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Términos de pago</Label>
                <Input id="paymentTerms" defaultValue={editingSupplier?.paymentTerms} />
              </div>
              <div>
                <Label htmlFor="rating">Calificación (1-5)</Label>
                <Input id="rating" type="number" min="1" max="5" step="0.1" defaultValue={editingSupplier?.rating} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" defaultChecked={editingSupplier?.status === "active"} />
              <Label htmlFor="active">Proveedor activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSupplierModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                {editingSupplier ? "Actualizar" : "Crear"} Proveedor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingOrder ? "Editar Orden" : "Nueva Orden de Compra"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderSupplier">Proveedor</Label>
                <Select defaultValue={editingOrder?.supplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select defaultValue={editingOrder?.priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderDate">Fecha de orden</Label>
                <Input id="orderDate" type="date" defaultValue={editingOrder?.date} />
              </div>
              <div>
                <Label htmlFor="expectedDate">Fecha esperada</Label>
                <Input id="expectedDate" type="date" defaultValue={editingOrder?.expectedDate} />
              </div>
            </div>

            <div>
              <Label>Productos a ordenar</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                {inventory
                  .filter((item) => item.status === "critical" || item.status === "low")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          Stock: {item.stock} {item.unit}
                        </span>
                      </div>
                      <Input type="number" placeholder="Cantidad" className="w-24" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOrderModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                {editingOrder ? "Actualizar" : "Crear"} Orden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
