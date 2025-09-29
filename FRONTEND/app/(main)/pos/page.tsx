"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Clock,
  CreditCard,
  Printer,
  ShoppingCart,
  Utensils,
  Coffee,
  Pizza,
  IceCream,
  Wine,
  Salad,
  Soup,
} from "lucide-react"

interface Producto {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen: string
  descripcion: string
  disponible: boolean
  tiempo_prep: number
}

interface ItemOrden {
  producto: Producto
  cantidad: number
  notas?: string
  modificadores?: string[]
}

interface Orden {
  mesa: number
  cliente?: string
  items: ItemOrden[]
  subtotal: number
  impuestos: number
  total: number
  mesero: string
}

const categorias = [
  { id: "entradas", nombre: "Entradas", icon: Salad, color: "from-green-400 to-green-600", count: 8 },
  { id: "sopas", nombre: "Sopas", icon: Soup, color: "from-orange-400 to-orange-600", count: 5 },
  { id: "platos-fuertes", nombre: "Platos Fuertes", icon: Utensils, color: "from-red-400 to-red-600", count: 12 },
  { id: "pizzas", nombre: "Pizzas", icon: Pizza, color: "from-yellow-400 to-yellow-600", count: 6 },
  { id: "bebidas", nombre: "Bebidas", icon: Coffee, color: "from-blue-400 to-blue-600", count: 15 },
  { id: "vinos", nombre: "Vinos", icon: Wine, color: "from-purple-400 to-purple-600", count: 10 },
  { id: "postres", nombre: "Postres", icon: IceCream, color: "from-pink-400 to-pink-600", count: 7 },
]

const productos: Producto[] = [
  {
    id: 1,
    nombre: "Tacos al Pastor",
    precio: 85,
    categoria: "platos-fuertes",
    imagen: "/tacos-al-pastor-mexicanos.jpg",
    descripcion: "3 tacos con carne al pastor, piña, cebolla y cilantro",
    disponible: true,
    tiempo_prep: 15,
  },
  {
    id: 2,
    nombre: "Quesadillas de Flor",
    precio: 65,
    categoria: "entradas",
    imagen: "/quesadillas-de-flor-de-calabaza.jpg",
    descripcion: "Quesadillas con flor de calabaza y queso oaxaca",
    disponible: true,
    tiempo_prep: 10,
  },
  {
    id: 3,
    nombre: "Pozole Rojo",
    precio: 120,
    categoria: "sopas",
    imagen: "/pozole-rojo-mexicano.jpg",
    descripcion: "Pozole tradicional con cerdo, maíz cacahuazintle y chile guajillo",
    disponible: true,
    tiempo_prep: 5,
  },
  {
    id: 4,
    nombre: "Enchiladas Verdes",
    precio: 95,
    categoria: "platos-fuertes",
    imagen: "/enchiladas-verdes-mexicanas.jpg",
    descripcion: "Enchiladas bañadas en salsa verde con pollo y crema",
    disponible: true,
    tiempo_prep: 20,
  },
  {
    id: 5,
    nombre: "Agua de Horchata",
    precio: 35,
    categoria: "bebidas",
    imagen: "/agua-de-horchata-mexicana.jpg",
    descripcion: "Agua fresca de horchata con canela",
    disponible: true,
    tiempo_prep: 2,
  },
  {
    id: 6,
    nombre: "Flan Napolitano",
    precio: 55,
    categoria: "postres",
    imagen: "/flan-napolitano-mexicano.jpg",
    descripcion: "Flan casero con caramelo y vainilla",
    disponible: true,
    tiempo_prep: 5,
  },
  {
    id: 7,
    nombre: "Cerveza Corona",
    precio: 45,
    categoria: "bebidas",
    imagen: "/cerveza-corona-mexicana.jpg",
    descripcion: "Cerveza Corona 355ml bien fría",
    disponible: true,
    tiempo_prep: 1,
  },
  {
    id: 8,
    nombre: "Guacamole",
    precio: 75,
    categoria: "entradas",
    imagen: "/guacamole-mexicano.jpg",
    descripcion: "Guacamole fresco con totopos",
    disponible: true,
    tiempo_prep: 8,
  },
]

export default function POSPage() {
  const [categoriaActiva, setCategoriaActiva] = useState("platos-fuertes")
  const [busqueda, setBusqueda] = useState("")
  const [orden, setOrden] = useState<Orden>({
    mesa: 5,
    cliente: "Mesa 5",
    items: [],
    subtotal: 0,
    impuestos: 0,
    total: 0,
    mesero: "Juan Pérez",
  })

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria = producto.categoria === categoriaActiva
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda && producto.disponible
  })

  const agregarItem = (producto: Producto) => {
    const itemExistente = orden.items.find((item) => item.producto.id === producto.id)

    if (itemExistente) {
      const nuevosItems = orden.items.map((item) =>
        item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
      )
      actualizarOrden(nuevosItems)
    } else {
      const nuevosItems = [...orden.items, { producto, cantidad: 1 }]
      actualizarOrden(nuevosItems)
    }
  }

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(productoId)
      return
    }

    const nuevosItems = orden.items.map((item) =>
      item.producto.id === productoId ? { ...item, cantidad: nuevaCantidad } : item,
    )
    actualizarOrden(nuevosItems)
  }

  const eliminarItem = (productoId: number) => {
    const nuevosItems = orden.items.filter((item) => item.producto.id !== productoId)
    actualizarOrden(nuevosItems)
  }

  const actualizarOrden = (nuevosItems: ItemOrden[]) => {
    const subtotal = nuevosItems.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
    const impuestos = subtotal * 0.16 // 16% IVA
    const total = subtotal + impuestos

    setOrden({
      ...orden,
      items: nuevosItems,
      subtotal,
      impuestos,
      total,
    })
  }

  const limpiarOrden = () => {
    setOrden({
      ...orden,
      items: [],
      subtotal: 0,
      impuestos: 0,
      total: 0,
    })
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Lado Izquierdo - Catálogo de Productos */}
      <div className="flex-1 flex flex-col">
        {/* Header del Catálogo */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Punto de Venta</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Tabs de Categorías */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaActiva === categoria.id ? "default" : "outline"}
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  categoriaActiva === categoria.id ? "gradient-wine text-white" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <categoria.icon className="h-4 w-4" />
                {categoria.nombre}
                <Badge variant="secondary" className="ml-1">
                  {categoria.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productosFiltrados.map((producto) => (
              <Card
                key={producto.id}
                className="bg-white shadow-lg border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => agregarItem(producto)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={producto.imagen || "/placeholder.svg"}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{producto.nombre}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">${producto.precio}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {producto.tiempo_prep}min
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Lado Derecho - Orden Actual */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Header de la Orden */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Orden Actual</h2>
            <Button variant="ghost" size="sm" onClick={limpiarOrden} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Mesa {orden.mesa}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Mesero: {orden.mesero}</span>
            </div>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {orden.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay productos en la orden</p>
              <p className="text-sm text-gray-400 mt-1">Selecciona productos del menú</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orden.items.map((item, index) => (
                <div key={`${item.producto.id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.producto.nombre}</h4>
                      <p className="text-sm text-gray-600">${item.producto.precio} c/u</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarItem(item.producto.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.cantidad}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.producto.precio * item.cantidad).toLocaleString()}
                    </span>
                  </div>

                  {/* Notas especiales */}
                  <div className="mt-2">
                    <Textarea
                      placeholder="Notas especiales..."
                      value={item.notas || ""}
                      onChange={(e) => {
                        const nuevosItems = orden.items.map((i, idx) =>
                          idx === index ? { ...i, notas: e.target.value } : i,
                        )
                        actualizarOrden(nuevosItems)
                      }}
                      className="text-xs h-16 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen y Botones de Acción */}
        {orden.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${orden.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">${orden.impuestos.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-red-600">${orden.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2">
              <Button className="w-full gradient-wine text-white h-12 text-lg font-semibold">
                <CreditCard className="h-5 w-5 mr-2" />
                Procesar Pago
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10 bg-transparent">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" className="h-10 bg-transparent">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
