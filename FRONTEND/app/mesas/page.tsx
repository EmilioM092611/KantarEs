"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Clock, DollarSign, Search, Filter, User, Calendar, CheckCircle, AlertCircle } from "lucide-react"

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

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>(mesasData)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
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
              className="pl-10 w-80 bg-white border-gray-200"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Mesas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 shadow-lg border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Disponibles</p>
                <p className="text-2xl font-bold text-green-900">{estadisticas.disponibles}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 shadow-lg border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Ocupadas</p>
                <p className="text-2xl font-bold text-red-900">{estadisticas.ocupadas}</p>
              </div>
              <User className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 shadow-lg border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Reservadas</p>
                <p className="text-2xl font-bold text-yellow-900">{estadisticas.reservadas}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Ocupación</p>
                <p className="text-2xl font-bold text-purple-900">{estadisticas.ocupacion}%</p>
              </div>
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                <div
                  className="w-6 h-6 bg-purple-600 rounded-full"
                  style={{
                    background: `conic-gradient(#9333ea ${estadisticas.ocupacion * 3.6}deg, #e5e7eb 0deg)`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Ingresos Turno</p>
                <p className="text-xl font-bold text-green-900">${estadisticas.ingresosTurno.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
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
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Plano del Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
            {mesasFiltradas.map((mesa) => (
              <Dialog key={mesa.id}>
                <DialogTrigger asChild>
                  <div
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105
                      ${getEstadoColor(mesa.estado)}
                    `}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getEstadoIcon(mesa.estado)}
                        <h4 className="font-bold text-lg text-gray-900">Mesa {mesa.numero}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{mesa.capacidad} personas</p>

                      {mesa.estado === "ocupada" && (
                        <>
                          <p className="text-xs text-gray-700 mb-1">Mesero: {mesa.mesero}</p>
                          <p className="font-semibold text-red-600 mb-1">${mesa.total?.toLocaleString()}</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {mesa.tiempo} min
                          </div>
                        </>
                      )}

                      {mesa.estado === "reservada" && (
                        <>
                          <p className="text-xs text-gray-700 mb-1">{mesa.cliente}</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                            <Calendar className="h-3 w-3" />
                            {mesa.reservaHora}
                          </div>
                        </>
                      )}

                      {mesa.estado === "limpieza" && <p className="text-xs text-blue-600 font-medium">En limpieza</p>}
                    </div>

                    {mesa.estado === "ocupada" && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{mesa.items}</span>
                      </div>
                    )}

                    {mesa.estado === "reservada" && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getEstadoIcon(mesa.estado)}
                      Mesa {mesa.numero}
                      <Badge
                        variant={mesa.estado === "disponible" ? "default" : "secondary"}
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

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Capacidad</Label>
                        <p className="font-semibold">{mesa.capacidad} personas</p>
                      </div>
                      {mesa.estado === "ocupada" && mesa.tiempo && (
                        <div>
                          <Label className="text-sm text-gray-500">Tiempo ocupada</Label>
                          <p className="font-semibold">{mesa.tiempo} minutos</p>
                        </div>
                      )}
                    </div>

                    {mesa.estado === "ocupada" && (
                      <>
                        <div>
                          <Label className="text-sm text-gray-500">Cliente</Label>
                          <p className="font-semibold">{mesa.cliente}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Mesero asignado</Label>
                          <p className="font-semibold">{mesa.mesero}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">Total cuenta</Label>
                            <p className="font-semibold text-lg">${mesa.total?.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Items</Label>
                            <p className="font-semibold">{mesa.items} productos</p>
                          </div>
                        </div>
                      </>
                    )}

                    {mesa.estado === "reservada" && (
                      <>
                        <div>
                          <Label className="text-sm text-gray-500">Cliente</Label>
                          <p className="font-semibold">{mesa.cliente}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Hora de reserva</Label>
                          <p className="font-semibold">{mesa.reservaHora}</p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 pt-4">
                      {mesa.estado === "disponible" && (
                        <>
                          <Button className="flex-1 gradient-wine text-white">Asignar Mesa</Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Reservar
                          </Button>
                        </>
                      )}
                      {mesa.estado === "ocupada" && (
                        <>
                          <Button className="flex-1 gradient-wine text-white">Ver Orden</Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Cobrar
                          </Button>
                        </>
                      )}
                      {mesa.estado === "reservada" && (
                        <>
                          <Button className="flex-1 gradient-wine text-white">Confirmar Llegada</Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Cancelar Reserva
                          </Button>
                        </>
                      )}
                      {mesa.estado === "limpieza" && (
                        <Button className="flex-1 gradient-wine text-white">Marcar como Lista</Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
