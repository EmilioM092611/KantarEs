"use client"

import React, { useState, useCallback, useMemo } from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Users,
  Clock,
  DollarSign,
  Search,
  Filter,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Star,
  ArrowLeft,
  ShoppingCart,
  Minus,
  X,
  Send,
  Package,
} from "lucide-react"

interface Mesa {
  id: number
  numero: number
  capacidad: number
  estado: "disponible" | "ocupada" | "reservada" | "limpieza"
  mesero?: string
  cliente?: string
  total?: number
  tiempo?: number
  horaInicio?: string
  reservaHora?: string
  items?: number
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  preparationTime: number
  tags?: string[] // Added tags
  stock?: number // Added stock
}

interface OrderItem {
  id: number
  product: Product
  quantity: number
  notes?: string
}

const productCategories = [
  "ENTRADAS",
  "PLATOS PRINCIPALES",
  "HAMBURGUESAS",
  "ENSALADAS",
  "POSTRES",
  "BEBIDAS",
  "CERVEZA",
  "VINOS",
  "CÓCTELES",
  "TEQUILA",
  "WHISKY",
  "MARISCOS", // Added MARISCOS
  "CARNES", // Added CARNES
]

const productsData: Product[] = [
  {
    id: 1,
    name: "Guacamole Tradicional",
    description:
      "Aguacate fresco machacado con jitomate, cebolla, chile serrano, cilantro y limón. Servido con totopos artesanales.",
    price: 120.0,
    category: "ENTRADAS",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=400&fit=crop&crop=center",
    preparationTime: 8,
    tags: ["Popular", "Vegetariano"],
    stock: 45,
  },
  {
    id: 2,
    name: "Pozole Rojo Guerrerense",
    description:
      "Caldo tradicional con maíz cacahuazintle, carne de cerdo y chile guajillo. Acompañado de lechuga, rábano, orégano y limón.",
    price: 145.0,
    category: "PLATOS PRINCIPALES",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=400&fit=crop&crop=center",
    preparationTime: 5,
    tags: ["Popular", "Especialidad"],
    stock: 25,
  },
  {
    id: 3,
    name: "Enchiladas Verdes de Pollo",
    description:
      "Tortillas rellenas de pollo deshebrado, bañadas en salsa verde de tomatillo. Con crema, queso fresco y cebolla.",
    price: 110.0,
    category: "PLATOS PRINCIPALES",
    image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=400&fit=crop&crop=center",
    preparationTime: 18,
    tags: ["Disponible"],
    stock: 35,
  },
  {
    id: 4,
    name: "Camarones a la Diabla",
    description:
      "Camarones jumbo salteados en salsa picante de chiles chipotle y guajillo. Acompañados de arroz blanco.",
    price: 220.0,
    category: "MARISCOS",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop&crop=center",
    preparationTime: 15,
    tags: ["Especialidad", "Picante"],
    stock: 20,
  },
  {
    id: 5,
    name: "Arrachera a la Parrilla",
    description:
      "Corte de arrachera marinado 24 horas, asado a la parrilla. Servido con guacamole, frijoles charros y tortillas.",
    price: 280.0,
    category: "CARNES",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center",
    preparationTime: 20,
    tags: ["Especialidad"],
    stock: 15,
  },
  {
    id: 6,
    name: "Agua de Horchata Artesanal",
    description: "Bebida tradicional de arroz con canela, vainilla y leche condensada. Preparada diariamente en casa.",
    price: 45.0,
    category: "BEBIDAS",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop&crop=center",
    preparationTime: 3,
    tags: ["Popular"],
    stock: 80,
  },
  {
    id: 7,
    name: "Flan Napolitano Casero",
    description: "Postre tradicional de huevo y leche con caramelo quemado. Receta familiar de tres generaciones.",
    price: 65.0,
    category: "POSTRES",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center",
    preparationTime: 5,
    tags: ["Especialidad"],
    stock: 12,
  },
  {
    id: 8,
    name: "Cerveza Corona",
    description: "Cerveza mexicana ligera y refrescante, perfecta para acompañar cualquier platillo",
    price: 55.0,
    category: "CERVEZA",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop&crop=center",
    preparationTime: 2,
    tags: ["Disponible"],
    stock: 150,
  },
]

const mesasData: Mesa[] = [
  {
    id: 1,
    numero: 1,
    capacidad: 4,
    estado: "ocupada",
    mesero: "Ana García",
    cliente: "Familia López",
    total: 1250,
    tiempo: 45,
    horaInicio: "19:15",
    items: 3,
  },
  {
    id: 2,
    numero: 2,
    capacidad: 2,
    estado: "disponible",
  },
  {
    id: 3,
    numero: 3,
    capacidad: 6,
    estado: "reservada",
    cliente: "Sr. Martínez",
    reservaHora: "20:30",
  },
  {
    id: 4,
    numero: 4,
    capacidad: 4,
    estado: "ocupada",
    mesero: "Carlos Ruiz",
    cliente: "Pareja Joven",
    total: 890,
    tiempo: 25,
    horaInicio: "19:45",
    items: 2,
  },
  {
    id: 5,
    numero: 5,
    capacidad: 8,
    estado: "limpieza",
  },
  {
    id: 6,
    numero: 6,
    capacidad: 2,
    estado: "disponible",
  },
  {
    id: 7,
    numero: 7,
    capacidad: 4,
    estado: "ocupada",
    mesero: "María Santos",
    cliente: "Grupo Amigos",
    total: 1680,
    tiempo: 60,
    horaInicio: "19:00",
    items: 4,
  },
  {
    id: 8,
    numero: 8,
    capacidad: 2,
    estado: "disponible",
  },
  {
    id: 9,
    numero: 9,
    capacidad: 4,
    estado: "reservada",
    cliente: "Sra. González",
    reservaHora: "21:00",
  },
  {
    id: 10,
    numero: 10,
    capacidad: 6,
    estado: "disponible",
  },
  {
    id: 11,
    numero: 11,
    capacidad: 4,
    estado: "ocupada",
    mesero: "Pedro Morales",
    cliente: "Cena Negocios",
    total: 2100,
    tiempo: 35,
    horaInicio: "19:30",
    items: 5,
  },
  {
    id: 12,
    numero: 12,
    capacidad: 2,
    estado: "disponible",
  },
  {
    id: 13,
    numero: 13,
    capacidad: 4,
    estado: "limpieza",
  },
  {
    id: 14,
    numero: 14,
    capacidad: 8,
    estado: "disponible",
  },
  {
    id: 15,
    numero: 15,
    capacidad: 4,
    estado: "ocupada",
    mesero: "Laura Vega",
    cliente: "Familia Grande",
    total: 1950,
    tiempo: 50,
    horaInicio: "19:10",
    items: 6,
  },
  {
    id: 16,
    numero: 16,
    capacidad: 2,
    estado: "disponible",
  },
  {
    id: 17,
    numero: 17,
    capacidad: 6,
    estado: "reservada",
    cliente: "Evento Cumpleaños",
    reservaHora: "20:00",
  },
  {
    id: 18,
    numero: 18,
    capacidad: 4,
    estado: "disponible",
  },
  {
    id: 19,
    numero: 19,
    capacidad: 2,
    estado: "ocupada",
    mesero: "Diego Torres",
    cliente: "Cita Romántica",
    total: 750,
    tiempo: 20,
    horaInicio: "19:50",
    items: 2,
  },
  {
    id: 20,
    numero: 20,
    capacidad: 4,
    estado: "disponible",
  },
]

const meserosData = [
  {
    id: 1,
    nombre: "Rodo",
    iniciales: "RD",
    disponible: true,
    rating: 5.0,
    mesasActivas: 2,
    color: "bg-blue-500",
  },
  {
    id: 2,
    nombre: "Carlos López",
    iniciales: "CL",
    disponible: false,
    rating: 4.9,
    mesasActivas: 3,
    color: "bg-purple-500",
  },
  {
    id: 3,
    nombre: "Ana Martín",
    iniciales: "AM",
    disponible: true,
    rating: 4.7,
    mesasActivas: 1,
    color: "bg-indigo-500",
  },
  {
    id: 4,
    nombre: "Luis Herrera",
    iniciales: "LH",
    disponible: true,
    rating: 4.6,
    mesasActivas: 2,
    color: "bg-teal-500",
  },
]

const WaiterCard = React.memo(
  ({
    mesero,
    isSelected,
    onSelect,
  }: {
    mesero: any
    isSelected: boolean
    onSelect: (mesero: any) => void
  }) => {
    const handleClick = useCallback(() => {
      if (mesero.disponible) {
        onSelect(mesero)
      }
    }, [mesero, onSelect])

    return (
      <div
        onClick={handleClick}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
          isSelected
            ? "border-red-500 bg-red-50 shadow-md"
            : mesero.disponible
              ? "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 hover:shadow-lg"
              : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              mesero.color || "bg-blue-500"
            }`}
          >
            {mesero.iniciales}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{mesero.nombre}</h3>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                mesero.disponible ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {mesero.disponible ? "Disponible" : "Ocupado"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{mesero.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{mesero.mesasActivas} mesas</span>
          </div>
        </div>
      </div>
    )
  },
)

WaiterCard.displayName = "WaiterCard"

export default function MesasPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState<Mesa[]>(mesasData)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [pasoActual, setPasoActual] = useState(1)
  const [meseroSeleccionado, setMeseroSeleccionado] = useState<any>(null)
  const [numeroClientes, setNumeroClientes] = useState(1)
  const [nombreCliente, setNombreCliente] = useState("")

  const [vistaActual, setVistaActual] = useState<"mesas" | "pos">("mesas")
  const [mesaEnOrden, setMesaEnOrden] = useState<Mesa | null>(null)
  const [categoriaActiva, setCategoriaActiva] = useState("ENTRADAS") // Changed default category
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [ordenActual, setOrdenActual] = useState<OrderItem[]>([])

  const estadisticas = {
    total: mesas.length,
    disponibles: mesas.filter((m) => m.estado === "disponible").length,
    ocupadas: mesas.filter((m) => m.estado === "ocupada").length,
    reservadas: mesas.filter((m) => m.estado === "reservada").length,
    limpieza: mesas.filter((m) => m.estado === "limpieza").length,
    ocupacion: Math.round((mesas.filter((m) => m.estado === "ocupada").length / mesas.length) * 100),
    ingresosTurno: mesas.filter((m) => m.estado === "ocupada").reduce((sum, m) => sum + (m.total || 0), 0),
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-50 border-green-300 hover:shadow-lg hover:shadow-green-100"
      case "ocupada":
        return "bg-red-50 border-red-300 hover:shadow-lg hover:shadow-red-100"
      case "reservada":
        return "bg-yellow-50 border-yellow-300 hover:shadow-lg hover:shadow-yellow-100"
      case "limpieza":
        return "bg-blue-50 border-blue-300 hover:shadow-lg hover:shadow-blue-100"
      default:
        return "bg-gray-50 border-gray-300"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "ocupada":
        return <User className="h-4 w-4 text-red-600" />
      case "reservada":
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case "limpieza":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const mesasFiltradas = mesas.filter((mesa) => {
    const coincideBusqueda =
      mesa.numero.toString().includes(busqueda) ||
      mesa.mesero?.toLowerCase().includes(busqueda.toLowerCase()) ||
      mesa.cliente?.toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado = filtroEstado === "todos" || mesa.estado === filtroEstado

    return coincideBusqueda && coincideEstado
  })

  const abrirMesa = () => {
    if (!mesaSeleccionada || !meseroSeleccionado || !nombreCliente) return

    const mesasActualizadas = mesas.map((mesa) =>
      mesa.id === mesaSeleccionada.id
        ? {
            ...mesa,
            estado: "ocupada" as const,
            mesero: meseroSeleccionado.nombre,
            cliente: nombreCliente,
            horaInicio: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            tiempo: 0,
            total: 0,
            items: 0,
          }
        : mesa,
    )

    setMesas(mesasActualizadas)
    cerrarModal()

    const mesaActualizada = mesasActualizadas.find((m) => m.id === mesaSeleccionada.id)
    setMesaEnOrden(mesaActualizada || null)
    setVistaActual("pos")
  }

  const cerrarMesa = (mesa: Mesa) => {
    const mesasActualizadas = mesas.map((m) =>
      m.id === mesa.id
        ? {
            ...m,
            estado: "limpieza" as const,
            mesero: undefined,
            cliente: undefined,
            horaInicio: undefined,
            tiempo: undefined,
            total: undefined,
            items: undefined,
          }
        : m,
    )
    setMesas(mesasActualizadas)
  }

  const marcarComoLista = (mesa: Mesa) => {
    const mesasActualizadas = mesas.map((m) => (m.id === mesa.id ? { ...m, estado: "disponible" as const } : m))
    setMesas(mesasActualizadas)
  }

  const abrirModalMesa = (mesa: Mesa) => {
    setMesaSeleccionada(mesa)
    setPasoActual(1)
    setMeseroSeleccionado(null)
    setNumeroClientes(1)
    setNombreCliente("")
    setDialogAbierto(true)
  }

  const handleMeseroSelect = useCallback((mesero: any) => {
    setMeseroSeleccionado(mesero)
  }, [])

  const cerrarModal = useCallback(() => {
    setDialogAbierto(false)
    setPasoActual(1)
    setMeseroSeleccionado(null)
    setNumeroClientes(1)
    setNombreCliente("")
    setMesaSeleccionada(null)
  }, [])

  const meseros = useMemo(() => meserosData, [])

  const siguientePaso = () => {
    if (pasoActual < 3) {
      setPasoActual(pasoActual + 1)
    }
  }

  const anteriorPaso = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const abrirPOS = (mesa: Mesa) => {
    setMesaEnOrden(mesa)
    setVistaActual("pos")
    setOrdenActual([])
  }

  const volverAMesas = () => {
    setVistaActual("mesas")
    setMesaEnOrden(null)
    setOrdenActual([])
  }

  const agregarProducto = (product: Product) => {
    const existingItem = ordenActual.find((item) => item.product.id === product.id)

    if (existingItem) {
      setOrdenActual(
        ordenActual.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrdenActual([
        ...ordenActual,
        {
          id: Date.now(),
          product,
          quantity: 1,
        },
      ])
    }
  }

  const actualizarCantidad = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrdenActual(ordenActual.filter((item) => item.id !== itemId))
    } else {
      setOrdenActual(ordenActual.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const eliminarItem = (itemId: number) => {
    setOrdenActual(ordenActual.filter((item) => item.id !== itemId))
  }

  const calcularSubtotal = () => {
    return ordenActual.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const calcularIVA = () => {
    return calcularSubtotal() * 0.16
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA()
  }

  const enviarACocina = () => {
    if (ordenActual.length === 0) return

    // Update table with order info
    const mesasActualizadas = mesas.map((mesa) =>
      mesa.id === mesaEnOrden?.id
        ? {
            ...mesa,
            total: calcularTotal(),
            items: ordenActual.reduce((sum, item) => sum + item.quantity, 0),
          }
        : mesa,
    )

    setMesas(mesasActualizadas)

    // Clear order and go back to tables
    setOrdenActual([])
    volverAMesas()

    // Here you would typically send the order to kitchen/orders module
    console.log("Orden enviada a cocina:", {
      mesa: mesaEnOrden,
      items: ordenActual,
      total: calcularTotal(),
    })
  }

  const productosFiltrados = productsData.filter((product) => {
    const matchesCategory = product.category === categoriaActiva
    const matchesSearch =
      product.name.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      product.description.toLowerCase().includes(busquedaProducto.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (vistaActual === "pos" && mesaEnOrden) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={volverAMesas} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mesa {mesaEnOrden.numero} - SALÓN</h1>
                  <p className="text-sm text-gray-600">
                    {ordenActual.reduce((sum, item) => sum + item.quantity, 0)} clientes • {mesaEnOrden.mesero}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Abierta: {mesaEnOrden.horaInicio}</p>
                <p className="text-2xl font-bold text-green-600">${calcularTotal().toFixed(2)}</p>
              </div>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none"
                onClick={() => cerrarMesa(mesaEnOrden)}
              >
                Cerrar Mesa
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Products */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex gap-2 overflow-x-auto">
                {productCategories.map((category) => (
                  <Button
                    key={category}
                    variant={categoriaActiva === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoriaActiva(category)}
                    className={`whitespace-nowrap ${
                      categoriaActiva === category
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-gray-200 overflow-hidden"
                    onClick={() => agregarProducto(product)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {product.tags?.map((tag, index) => (
                          <Badge
                            key={index}
                            className={`text-xs px-2 py-1 ${
                              tag === "Popular"
                                ? "bg-yellow-500 text-white"
                                : tag === "Vegetariano"
                                  ? "bg-green-500 text-white"
                                  : tag === "Especialidad"
                                    ? "bg-purple-500 text-white"
                                    : tag === "Picante"
                                      ? "bg-red-500 text-white"
                                      : "bg-blue-500 text-white"
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md">
                        <span className="font-bold text-gray-900">${product.price}</span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-green-500 text-white text-xs">Disponible</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs mb-2">
                            {product.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{product.description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {product.preparationTime} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Stock: {product.stock}
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                          onClick={(e) => {
                            e.stopPropagation()
                            agregarProducto(product)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Current Order */}
          <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Pedido Actual</h2>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {ordenActual.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Clientes</span>
                </div>
                <span className="font-semibold">{numeroClientes}</span>
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Tiempo</span>
                </div>
                <span className="font-semibold">{mesaEnOrden.horaInicio}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {ordenActual.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No hay productos en la orden</p>
                  <p className="text-gray-400 text-xs mt-1">Selecciona productos del menú para agregar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordenActual.map((item) => (
                    <Card key={item.id} className="p-4 bg-white border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0 border-gray-300"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0 border-gray-300"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">${item.product.price.toFixed(2)} c/u</p>
                          <p className="font-bold text-green-600">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {ordenActual.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${calcularSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%):</span>
                    <span className="font-semibold">${calcularIVA().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${calcularTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={enviarACocina} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar a Cocina
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Generar Cuenta
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Mesas</h1>
            <p className="text-gray-600 mt-1">Monitorea el estado de todas las mesas en tiempo real</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar mesa, mesero o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 w-80 bg-white border-gray-200 transition-smooth focus-ring"
              />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent transition-smooth">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: "Total Mesas", value: estadisticas.total, icon: Users, color: "text-gray-400" },
          {
            title: "Disponibles",
            value: estadisticas.disponibles,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50 border-green-200",
          },
          {
            title: "Ocupadas",
            value: estadisticas.ocupadas,
            icon: User,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            title: "Reservadas",
            value: estadisticas.reservadas,
            icon: Calendar,
            color: "text-yellow-600",
            bg: "bg-yellow-50 border-yellow-200",
          },
          {
            title: "Ocupación",
            value: `${estadisticas.ocupacion}%`,
            icon: null,
            color: "text-purple-600",
            bg: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
          },
          {
            title: "Ingresos Turno",
            value: `$${estadisticas.ingresosTurno.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className={`shadow-lg border-0 transition-smooth hover:shadow-xl ${stat.bg || "bg-white"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${stat.bg ? stat.color.replace("text-", "text-").replace("-600", "-700") : "text-gray-500"}`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`text-2xl font-bold ${stat.bg ? stat.color.replace("text-", "text-").replace("-600", "-900") : "text-gray-900"}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  {stat.icon && <stat.icon className={`h-8 w-8 ${stat.color}`} />}
                  {stat.title === "Ocupación" && (
                    <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                      <div
                        className="w-6 h-6 bg-purple-600 rounded-full"
                        style={{
                          background: `conic-gradient(#9333ea ${estadisticas.ocupacion * 3.6}deg, #e5e7eb 0deg)`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "todos", label: "Todas", count: estadisticas.total },
          { key: "disponible", label: "Disponibles", count: estadisticas.disponibles },
          { key: "ocupada", label: "Ocupadas", count: estadisticas.ocupadas },
          { key: "reservada", label: "Reservadas", count: estadisticas.reservadas },
          { key: "limpieza", label: "Limpieza", count: estadisticas.limpieza },
        ].map((filtro) => (
          <Button
            key={filtro.key}
            variant={filtroEstado === filtro.key ? "default" : "outline"}
            onClick={() => setFiltroEstado(filtro.key)}
            className={`gap-2 ${filtroEstado === filtro.key ? "gradient-wine text-white" : "hover:bg-gray-50"}`}
          >
            {filtro.label}
            <Badge variant="secondary" className="ml-1">
              {filtro.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Plano del Restaurante */}
      <SlideIn direction="up" delay={0.3}>
        <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Plano del Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              {mesasFiltradas.map((mesa, index) => (
                <SlideIn key={mesa.id} direction="up" delay={0.4 + index * 0.05}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div
                        className={`
                          relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl
                          ${getEstadoColor(mesa.estado)}
                          ${mesa.estado === "ocupada" ? "ring-2 ring-red-200 ring-opacity-50" : ""}
                          ${mesa.estado === "reservada" ? "ring-2 ring-yellow-200 ring-opacity-50" : ""}
                        `}
                      >
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {getEstadoIcon(mesa.estado)}
                            <h4 className="font-bold text-xl text-gray-900">Mesa {mesa.numero}</h4>
                          </div>

                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Users className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-600">{mesa.capacidad} personas</p>
                          </div>

                          {mesa.estado === "ocupada" && (
                            <div className="space-y-2">
                              <div className="bg-white/70 rounded-lg p-2">
                                <p className="text-xs text-gray-700 font-medium">{mesa.mesero}</p>
                                <p className="text-xs text-gray-600">{mesa.cliente}</p>
                              </div>
                              <p className="font-bold text-lg text-red-600">${mesa.total?.toLocaleString()}</p>
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {mesa.tiempo} min
                              </div>
                            </div>
                          )}

                          {mesa.estado === "reservada" && (
                            <div className="space-y-2">
                              <div className="bg-white/70 rounded-lg p-2">
                                <p className="text-xs text-gray-700 font-medium">{mesa.cliente}</p>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                                <Calendar className="h-3 w-3" />
                                {mesa.reservaHora}
                              </div>
                            </div>
                          )}

                          {mesa.estado === "limpieza" && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-blue-600 font-medium">En limpieza</p>
                            </div>
                          )}

                          {mesa.estado === "disponible" && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-green-600 font-medium">Lista para usar</p>
                            </div>
                          )}
                        </div>

                        {mesa.estado === "ocupada" && mesa.items && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">{mesa.items}</span>
                          </div>
                        )}

                        {mesa.estado === "reservada" && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg bg-white">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900">
                          {getEstadoIcon(mesa.estado)}
                          Mesa {mesa.numero}
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${
                              mesa.estado === "disponible"
                                ? "bg-green-100 text-green-800"
                                : mesa.estado === "ocupada"
                                  ? "bg-red-100 text-red-800"
                                  : mesa.estado === "reservada"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <Label className="text-sm text-gray-500">Capacidad</Label>
                            <p className="font-semibold text-lg text-gray-900">{mesa.capacidad} personas</p>
                          </div>
                          {mesa.estado === "ocupada" && mesa.tiempo && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <Label className="text-sm text-gray-500">Tiempo ocupada</Label>
                              <p className="font-semibold text-lg text-gray-900">{mesa.tiempo} min</p>
                            </div>
                          )}
                        </div>

                        {mesa.estado === "ocupada" && (
                          <div className="space-y-4">
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <Label className="text-sm text-red-600">Cliente</Label>
                                  <p className="font-semibold text-gray-900">{mesa.cliente}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-red-600">Mesero</Label>
                                  <p className="font-semibold text-gray-900">{mesa.mesero}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-red-600">Total cuenta</Label>
                                  <p className="font-bold text-xl text-red-700">${mesa.total?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-red-600">Items</Label>
                                  <p className="font-semibold text-gray-900">{mesa.items} productos</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {mesa.estado === "reservada" && (
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-yellow-600">Cliente</Label>
                                <p className="font-semibold text-gray-900">{mesa.cliente}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-yellow-600">Hora reserva</Label>
                                <p className="font-semibold text-gray-900">{mesa.reservaHora}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          {mesa.estado === "disponible" && (
                            <>
                              <Button
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
                                onClick={() => abrirModalMesa(mesa)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Abrir Mesa
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                Reservar
                              </Button>
                            </>
                          )}
                          {mesa.estado === "ocupada" && (
                            <>
                              <Button
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                onClick={() => abrirPOS(mesa)}
                              >
                                Ver Orden
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none"
                                onClick={() => cerrarMesa(mesa)}
                              >
                                Cerrar Mesa
                              </Button>
                            </>
                          )}
                          {mesa.estado === "reservada" && (
                            <>
                              <Button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                                Confirmar Llegada
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent hover:bg-red-50 hover:border-red-300 border-gray-300 text-gray-700"
                              >
                                Cancelar Reserva
                              </Button>
                            </>
                          )}
                          {mesa.estado === "limpieza" && (
                            <Button
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              onClick={() => marcarComoLista(mesa)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Lista
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </SlideIn>
              ))}
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Abrir Mesa {mesaSeleccionada?.numero}
                </DialogTitle>
                <p className="text-sm text-gray-600">SALÓN • Capacidad {mesaSeleccionada?.capacidad} personas</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Configura los detalles para abrir esta mesa y comenzar a atender a los clientes.
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step < pasoActual
                        ? "bg-green-500 text-white"
                        : step === pasoActual
                          ? "bg-red-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step < pasoActual ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 transition-all duration-300 ${
                        step < pasoActual ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {pasoActual === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Seleccionar Mesero</h3>
                  <p className="text-gray-600">Elige el mesero que atenderá esta mesa</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  {meseros.map((mesero) => (
                    <div
                      key={mesero.id}
                      onClick={() => handleMeseroSelect(mesero)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        meseroSeleccionado?.id === mesero.id
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } ${!mesero.disponible ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${mesero.color}`}
                        >
                          {mesero.iniciales}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{mesero.nombre}</h4>
                          <Badge
                            variant={mesero.disponible ? "default" : "secondary"}
                            className={`text-xs ${
                              mesero.disponible ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {mesero.disponible ? "Disponible" : "Ocupado"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{mesero.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{mesero.mesasActivas} mesas</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pasoActual === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Número de Clientes</h3>
                  <p className="text-gray-600">¿Cuántos clientes se sentarán en esta mesa?</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">Número de clientes</Label>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={numeroClientes === num ? "default" : "outline"}
                        onClick={() => setNumeroClientes(num)}
                        className={`h-12 ${
                          numeroClientes === num
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                        }`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {num}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={mesaSeleccionada?.capacidad}
                      value={numeroClientes}
                      onChange={(e) =>
                        setNumeroClientes(
                          Math.min(Number.parseInt(e.target.value) || 1, mesaSeleccionada?.capacidad || 1),
                        )
                      }
                      className="flex-1 bg-white border-gray-300"
                    />
                    <span className="text-sm text-gray-500">Máximo: {mesaSeleccionada?.capacidad} personas</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreCliente" className="text-sm font-medium text-gray-700">
                    Nombre del cliente principal
                  </Label>
                  <Input
                    id="nombreCliente"
                    placeholder="Ingresa el nombre del cliente"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
            )}

            {pasoActual === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Apertura</h3>
                  <p className="text-gray-600">Revisa los detalles antes de abrir la mesa</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mesa:</span>
                    <span className="font-semibold text-gray-900">Mesa {mesaSeleccionada?.numero} - SALÓN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-semibold text-gray-900">{mesaSeleccionada?.capacidad} personas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mesero asignado:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${meseroSeleccionado?.color}`}
                      >
                        {meseroSeleccionado?.iniciales}
                      </div>
                      <span className="font-semibold text-gray-900">{meseroSeleccionado?.nombre}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clientes:</span>
                    <span className="font-semibold text-gray-900">{numeroClientes} personas</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-semibold text-gray-900">{nombreCliente}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hora de apertura:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={pasoActual === 1 ? cerrarModal : anteriorPaso}
                className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {pasoActual === 1 ? "Cancelar" : "Atrás"}
              </Button>
              {pasoActual < 3 ? (
                <Button
                  onClick={siguientePaso}
                  disabled={
                    (pasoActual === 1 && !meseroSeleccionado) ||
                    (pasoActual === 2 && (!numeroClientes || !nombreCliente.trim()))
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continuar
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button onClick={abrirMesa} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Abrir Mesa
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
