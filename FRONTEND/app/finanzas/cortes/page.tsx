"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Clock,
  User,
  Minus,
  Calculator,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface Transaccion {
  id: number
  hora: string
  tipo: "venta" | "gasto" | "retiro" | "deposito"
  descripcion: string
  metodo: "efectivo" | "tarjeta" | "transferencia"
  monto: number
  usuario: string
  mesa?: number
}

const transaccionesData: Transaccion[] = [
  {
    id: 1,
    hora: "08:15",
    tipo: "venta",
    descripcion: "Mesa 5 - Desayuno familiar",
    metodo: "efectivo",
    monto: 450,
    usuario: "Ana García",
    mesa: 5,
  },
  {
    id: 2,
    hora: "08:32",
    tipo: "venta",
    descripcion: "Mesa 2 - Café y pan dulce",
    metodo: "tarjeta",
    monto: 120,
    usuario: "Carlos Ruiz",
    mesa: 2,
  },
  {
    id: 3,
    hora: "09:15",
    tipo: "gasto",
    descripcion: "Compra de ingredientes",
    metodo: "efectivo",
    monto: -280,
    usuario: "Juan Pérez",
  },
  {
    id: 4,
    hora: "09:45",
    tipo: "venta",
    descripcion: "Mesa 8 - Comida corrida",
    metodo: "transferencia",
    monto: 320,
    usuario: "María Santos",
    mesa: 8,
  },
  {
    id: 5,
    hora: "10:20",
    tipo: "venta",
    descripcion: "Mesa 12 - Tacos al pastor",
    metodo: "efectivo",
    monto: 185,
    usuario: "Pedro Morales",
    mesa: 12,
  },
]

export default function CortesPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>(transaccionesData)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalCorte, setModalCorte] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("todos")

  const corteActual = {
    fechaInicio: "2024-01-15",
    horaInicio: "08:00",
    usuario: "Juan Pérez",
    fondoInicial: 5000,
    activo: true,
  }

  const calcularTotales = () => {
    const efectivo = transacciones.filter((t) => t.metodo === "efectivo").reduce((sum, t) => sum + t.monto, 0)

    const tarjeta = transacciones.filter((t) => t.metodo === "tarjeta").reduce((sum, t) => sum + t.monto, 0)

    const transferencia = transacciones.filter((t) => t.metodo === "transferencia").reduce((sum, t) => sum + t.monto, 0)

    const ventas = transacciones.filter((t) => t.tipo === "venta").reduce((sum, t) => sum + t.monto, 0)

    const gastos = Math.abs(transacciones.filter((t) => t.tipo === "gasto").reduce((sum, t) => sum + t.monto, 0))

    return {
      efectivo: efectivo + corteActual.fondoInicial,
      tarjeta,
      transferencia,
      ventas,
      gastos,
      total: efectivo + tarjeta + transferencia + corteActual.fondoInicial,
      transacciones: transacciones.length,
    }
  }

  const totales = calcularTotales()

  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTipo === "todos") return true
    return t.tipo === filtroTipo
  })

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "venta":
        return "bg-green-100 text-green-800"
      case "gasto":
        return "bg-red-100 text-red-800"
      case "retiro":
        return "bg-orange-100 text-orange-800"
      case "deposito":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return <DollarSign className="h-4 w-4" />
      case "tarjeta":
        return <CreditCard className="h-4 w-4" />
      case "transferencia":
        return <Smartphone className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cortes de Caja</h1>
            <p className="text-gray-600 mt-1">Gestión y control de movimientos de efectivo</p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setModalCorte(true)} className="gradient-wine text-white gap-2">
              <Calculator className="h-4 w-4" />
              Cerrar Corte
            </Button>
          </div>
        </div>

        {/* Corte Actual */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-0 w-full">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Corte de Caja Actual</h2>
                <div className="flex items-center gap-4 opacity-90">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Iniciado: {corteActual.horaInicio} AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Usuario: {corteActual.usuario}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Fondo Inicial</p>
                <p className="text-3xl font-bold">${corteActual.fondoInicial.toLocaleString()}</p>
                <Badge className="mt-2 bg-white/20 text-white hover:bg-white/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Totales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card className="bg-green-50 shadow-lg border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Efectivo</p>
                  <p className="text-2xl font-bold text-green-900">${totales.efectivo.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {transacciones.filter((t) => t.metodo === "efectivo").length} transacciones
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 shadow-lg border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Tarjeta</p>
                  <p className="text-2xl font-bold text-blue-900">${totales.tarjeta.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {transacciones.filter((t) => t.metodo === "tarjeta").length} transacciones
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 shadow-lg border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Transferencia</p>
                  <p className="text-2xl font-bold text-purple-900">${totales.transferencia.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {transacciones.filter((t) => t.metodo === "transferencia").length} transacciones
                  </p>
                </div>
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 shadow-lg border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Gastos</p>
                  <p className="text-2xl font-bold text-orange-900">${totales.gastos.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {transacciones.filter((t) => t.tipo === "gasto").length} movimientos
                  </p>
                </div>
                <Minus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Total en Caja</p>
                  <p className="text-2xl font-bold text-gray-900">${totales.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">{totales.transacciones} movimientos</p>
                </div>
                <Calculator className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Transacciones */}
        <Card className="bg-white shadow-lg border-0 w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Movimientos del Día</CardTitle>
              <div className="flex gap-2">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "venta", label: "Ventas" },
                  { key: "gasto", label: "Gastos" },
                ].map((filtro) => (
                  <Button
                    key={filtro.key}
                    variant={filtroTipo === filtro.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo(filtro.key)}
                    className={filtroTipo === filtro.key ? "gradient-wine text-white" : ""}
                  >
                    {filtro.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaccionesFiltradas.map((transaccion, index) => (
                    <TableRow
                      key={transaccion.id}
                      className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      <TableCell className="font-mono text-sm">{transaccion.hora}</TableCell>
                      <TableCell>
                        <Badge className={getTipoColor(transaccion.tipo)}>
                          {transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{transaccion.descripcion}</p>
                          {transaccion.mesa && <p className="text-sm text-gray-500">Mesa {transaccion.mesa}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMetodoIcon(transaccion.metodo)}
                          <span className="capitalize">{transaccion.metodo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{transaccion.usuario}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${transaccion.monto > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaccion.monto > 0 ? "+" : ""}${Math.abs(transaccion.monto).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Cierre de Corte */}
        <Dialog open={modalCorte} onOpenChange={setModalCorte}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cerrar Corte de Caja
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Confirmar cierre</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta acción cerrará el corte actual y generará un reporte final.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Fondo inicial</Label>
                    <p className="font-semibold">${corteActual.fondoInicial.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Total ventas</Label>
                    <p className="font-semibold text-green-600">${totales.ventas.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Total gastos</Label>
                    <p className="font-semibold text-red-600">${totales.gastos.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Total en caja</Label>
                    <p className="font-semibold text-lg">${totales.total.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="efectivo_fisico">Efectivo físico contado</Label>
                  <Input id="efectivo_fisico" type="number" placeholder="0.00" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Notas adicionales sobre el corte..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setModalCorte(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button className="gradient-wine text-white flex-1 gap-2">
                  <Printer className="h-4 w-4" />
                  Cerrar e Imprimir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
