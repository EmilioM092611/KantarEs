"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Printer, Plus, Settings, Wifi, WifiOff, CheckCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

export default function ImpresorasPage() {
  const [printers] = useState([
    {
      id: 1,
      name: "Impresora Cocina",
      model: "Epson TM-T88VI",
      location: "Cocina Principal",
      status: "Conectada",
      type: "Térmica",
      ip: "192.168.1.101",
      lastPrint: "Hace 5 min",
    },
    {
      id: 2,
      name: "Impresora Bar",
      model: "Star TSP143III",
      location: "Área de Bar",
      status: "Conectada",
      type: "Térmica",
      ip: "192.168.1.102",
      lastPrint: "Hace 12 min",
    },
    {
      id: 3,
      name: "Impresora Recepción",
      model: "Epson TM-T20III",
      location: "Recepción",
      status: "Desconectada",
      type: "Térmica",
      ip: "192.168.1.103",
      lastPrint: "Hace 2 horas",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Conectada":
        return "bg-green-100 text-green-700"
      case "Desconectada":
        return "bg-red-100 text-red-700"
      case "Error":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Conectada":
        return <CheckCircle className="w-4 h-4" />
      case "Desconectada":
        return <WifiOff className="w-4 h-4" />
      case "Error":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Printer className="w-4 h-4" />
    }
  }

  const connectedPrinters = printers.filter((p) => p.status === "Conectada").length
  const totalPrinters = printers.length

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Impresoras</h1>
            <p className="text-gray-600 mt-1">Administra las impresoras del sistema POS</p>
          </div>
          <Button className="bg-gray-600 hover:bg-gray-700 transition-smooth hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Impresora
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
                    <p className="text-sm font-medium text-gray-600">Total Impresoras</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPrinters}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Printer className="w-6 h-6 text-gray-600" />
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
                    <p className="text-sm font-medium text-gray-600">Conectadas</p>
                    <p className="text-2xl font-bold text-green-600">{connectedPrinters}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Wifi className="w-6 h-6 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600">Desconectadas</p>
                    <p className="text-2xl font-bold text-red-600">{totalPrinters - connectedPrinters}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <WifiOff className="w-6 h-6 text-red-600" />
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
                    <p className="text-sm font-medium text-gray-600">Estado General</p>
                    <p className="text-2xl font-bold text-green-600">Operativo</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.6}>
        <Tabs defaultValue="printers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="printers">Impresoras</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="test">Pruebas</TabsTrigger>
          </TabsList>

          <TabsContent value="printers" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Impresoras Configuradas</CardTitle>
                  <CardDescription>Estado y configuración de todas las impresoras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {printers.map((printer, index) => (
                      <SlideIn key={printer.id} direction="up" delay={0.8 + index * 0.1}>
                        <Card className="transition-smooth hover:shadow-md hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="bg-gray-100 p-3 rounded-lg">
                                  <Printer className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{printer.name}</h4>
                                  <p className="text-sm text-gray-600">{printer.model}</p>
                                  <p className="text-xs text-gray-500">{printer.location}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(printer.status)}>
                                {getStatusIcon(printer.status)}
                                <span className="ml-1">{printer.status}</span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Tipo</p>
                                <p className="font-medium">{printer.type}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">IP</p>
                                <p className="font-medium">{printer.ip}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Última impresión</p>
                                <p className="font-medium">{printer.lastPrint}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Estado</p>
                                <p className="font-medium">{printer.status}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                Configurar
                              </Button>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Probar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
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

          <TabsContent value="settings" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>Ajustes globales para todas las impresoras</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="paperSize">Tamaño de Papel</Label>
                        <Select defaultValue="80mm">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="58mm">58mm</SelectItem>
                            <SelectItem value="80mm">80mm</SelectItem>
                            <SelectItem value="A4">A4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="encoding">Codificación</Label>
                        <Select defaultValue="utf8">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utf8">UTF-8</SelectItem>
                            <SelectItem value="latin1">Latin-1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Corte automático</Label>
                          <p className="text-sm text-gray-600">Cortar papel automáticamente</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Sonido de impresión</Label>
                          <p className="text-sm text-gray-600">Reproducir sonido al imprimir</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Pruebas de Impresión</CardTitle>
                  <CardDescription>Realiza pruebas para verificar el funcionamiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Printer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pruebas de Impresión</h3>
                    <p className="text-gray-600 mb-6">Selecciona una impresora para realizar una prueba</p>
                    <div className="flex gap-3 justify-center">
                      <Button className="bg-gray-600 hover:bg-gray-700">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Prueba
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Verificar Estado
                      </Button>
                    </div>
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
