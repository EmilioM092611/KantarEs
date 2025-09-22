"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Database,
  Bell,
  Globe,
  Clock,
  DollarSign,
  Printer,
  Wifi,
  Save,
  RefreshCw,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

export default function SistemaPage() {
  const router = useRouter()

  const [systemSettings, setSystemSettings] = useState({
    restaurantName: "KANTARES",
    address: "Av. Revolución 123, Col. Centro, CDMX",
    phone: "+52 55 1234 5678",
    email: "info@kantares.com",
    currency: "MXN",
    timezone: "America/Mexico_City",
    language: "es",
    taxRate: "16",
  })

  const handleLogout = () => {
    localStorage.removeItem("kantares_auth")
    localStorage.removeItem("kantares_user")
    // Force a page reload to ensure AuthGuard picks up the change
    window.location.href = "/"
  }

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
            <p className="text-gray-600 mt-1">Administra la configuración general del restaurante</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent transition-smooth hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 transition-smooth hover:scale-105">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </FadeIn>

      <SlideIn direction="up" delay={0.1}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
            <TabsTrigger value="backup">Respaldo</TabsTrigger>
          </TabsList>

          {/* Configuración General */}
          <TabsContent value="general" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Información del Restaurante
                  </CardTitle>
                  <CardDescription>Configuración básica del establecimiento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
                      <Input
                        id="restaurantName"
                        value={systemSettings.restaurantName}
                        onChange={(e) => setSystemSettings({ ...systemSettings, restaurantName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={systemSettings.phone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={systemSettings.address}
                      onChange={(e) => setSystemSettings({ ...systemSettings, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email de Contacto</Label>
                    <Input
                      id="email"
                      type="email"
                      value={systemSettings.email}
                      onChange={(e) => setSystemSettings({ ...systemSettings, email: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </SlideIn>

            <SlideIn direction="up" delay={0.3}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Configuración Regional
                  </CardTitle>
                  <CardDescription>Configuración de moneda, zona horaria e idioma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={systemSettings.currency}
                        onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                          <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select
                        value={systemSettings.timezone}
                        onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                          <SelectItem value="America/Cancun">Cancún</SelectItem>
                          <SelectItem value="America/Tijuana">Tijuana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={systemSettings.language}
                        onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={systemSettings.taxRate}
                      onChange={(e) => setSystemSettings({ ...systemSettings, taxRate: e.target.value })}
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </SlideIn>

            <SlideIn direction="up" delay={0.4}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Horarios de Operación
                  </CardTitle>
                  <CardDescription>Define los horarios de atención del restaurante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Lunes a Viernes</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="09:00" className="w-24" />
                        <span className="self-center">-</span>
                        <Input placeholder="22:00" className="w-24" />
                      </div>
                    </div>
                    <div>
                      <Label>Sábados y Domingos</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="10:00" className="w-24" />
                        <span className="self-center">-</span>
                        <Input placeholder="23:00" className="w-24" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          {/* Notificaciones */}
          <TabsContent value="notifications" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Configuración de Notificaciones
                  </CardTitle>
                  <CardDescription>Administra las alertas y notificaciones del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Nuevas órdenes</Label>
                        <p className="text-sm text-gray-600">Notificar cuando llegue una nueva orden</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Inventario bajo</Label>
                        <p className="text-sm text-gray-600">Alertar cuando los productos estén por agotarse</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Corte de caja</Label>
                        <p className="text-sm text-gray-600">Recordatorio para realizar el corte diario</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Reportes automáticos</Label>
                        <p className="text-sm text-gray-600">Enviar reportes semanales por email</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          {/* Integraciones */}
          <TabsContent value="integrations" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    Integraciones Externas
                  </CardTitle>
                  <CardDescription>Conecta con servicios externos y dispositivos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Printer className="w-8 h-8 text-gray-600" />
                          <div>
                            <h4 className="font-medium">Impresora de Tickets</h4>
                            <p className="text-sm text-gray-600">Epson TM-T20III</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Conectada
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Configurar
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-8 h-8 text-gray-600" />
                          <div>
                            <h4 className="font-medium">Terminal de Pago</h4>
                            <p className="text-sm text-gray-600">No configurada</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Desconectada</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Conectar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          {/* Respaldo */}
          <TabsContent value="backup" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Respaldo y Restauración
                  </CardTitle>
                  <CardDescription>Administra las copias de seguridad de tu información</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Respaldo Automático</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Respaldo diario</Label>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label className="text-sm">Hora del respaldo</Label>
                          <Select defaultValue="02:00">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="02:00">02:00 AM</SelectItem>
                              <SelectItem value="03:00">03:00 AM</SelectItem>
                              <SelectItem value="04:00">04:00 AM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Último Respaldo</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Fecha: 15 de Diciembre, 2024</p>
                        <p className="text-sm text-gray-600">Hora: 02:00 AM</p>
                        <p className="text-sm text-gray-600">Tamaño: 45.2 MB</p>
                        <Badge className="mt-2 bg-green-100 text-green-700">Exitoso</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Crear Respaldo Ahora
                    </Button>
                    <Button variant="outline">Restaurar desde Respaldo</Button>
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
