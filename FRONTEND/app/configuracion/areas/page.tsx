"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Edit3, Trash2, Users, Utensils, Coffee, Car } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

export default function AreasPage() {
  const [areas] = useState([
    {
      id: 1,
      name: "Salón Principal",
      description: "Área principal del restaurante con capacidad para 80 personas",
      capacity: 80,
      tables: 20,
      status: "Activa",
      type: "Comedor",
    },
    {
      id: 2,
      name: "Terraza",
      description: "Área exterior con vista panorámica",
      capacity: 40,
      tables: 10,
      status: "Activa",
      type: "Exterior",
    },
    {
      id: 3,
      name: "Salón Privado",
      description: "Área reservada para eventos especiales",
      capacity: 25,
      tables: 6,
      status: "Mantenimiento",
      type: "Privado",
    },
    {
      id: 4,
      name: "Bar",
      description: "Zona de bar y bebidas",
      capacity: 15,
      tables: 5,
      status: "Activa",
      type: "Bar",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa":
        return "bg-green-100 text-green-700"
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-700"
      case "Inactiva":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Comedor":
        return <Utensils className="w-5 h-5" />
      case "Bar":
        return <Coffee className="w-5 h-5" />
      case "Exterior":
        return <Car className="w-5 h-5" />
      case "Privado":
        return <Users className="w-5 h-5" />
      default:
        return <MapPin className="w-5 h-5" />
    }
  }

  const totalCapacity = areas.reduce((sum, area) => sum + area.capacity, 0)
  const totalTables = areas.reduce((sum, area) => sum + area.tables, 0)
  const activeAreas = areas.filter((area) => area.status === "Activa").length

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Áreas</h1>
            <p className="text-gray-600 mt-1">Administra las zonas y espacios del restaurante</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 transition-smooth hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Área
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
                    <p className="text-sm font-medium text-gray-600">Total Áreas</p>
                    <p className="text-2xl font-bold text-gray-900">{areas.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600">Total Mesas</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Utensils className="w-6 h-6 text-orange-600" />
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
                    <p className="text-sm font-medium text-gray-600">Áreas Activas</p>
                    <p className="text-2xl font-bold text-green-600">{activeAreas}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.6}>
        <Tabs defaultValue="areas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="areas">Áreas del Restaurante</TabsTrigger>
            <TabsTrigger value="layout">Distribución</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Áreas Configuradas</CardTitle>
                  <CardDescription>Gestiona todas las zonas del restaurante</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {areas.map((area, index) => (
                      <SlideIn key={area.id} direction="up" delay={0.8 + index * 0.1}>
                        <Card className="transition-smooth hover:shadow-md hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">{getTypeIcon(area.type)}</div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{area.name}</h4>
                                  <p className="text-sm text-gray-600">{area.type}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(area.status)}>{area.status}</Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">{area.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Capacidad</p>
                                <p className="font-medium">{area.capacity} personas</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Mesas</p>
                                <p className="font-medium">{area.tables} mesas</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Editar
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

          <TabsContent value="layout" className="space-y-6">
            <SlideIn direction="up" delay={0.7}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Distribución del Restaurante</CardTitle>
                  <CardDescription>Vista general de la distribución de espacios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Plano Interactivo</h3>
                    <p className="text-gray-600">
                      La funcionalidad de plano interactivo estará disponible próximamente
                    </p>
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
