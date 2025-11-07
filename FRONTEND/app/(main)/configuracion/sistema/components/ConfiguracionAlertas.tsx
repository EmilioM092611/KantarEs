// app/(dashboard)/sistema/components/ConfiguracionAlertas.tsx
// Componente para la configuración de alertas

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionAlertas } from "@/lib/api/configuracion";

interface ConfiguracionAlertasProps {
  config: ConfiguracionAlertas;
  onChange: (config: ConfiguracionAlertas) => void;
}

export const ConfiguracionAlertasComponent = ({
  config,
  onChange,
}: ConfiguracionAlertasProps) => {
  return (
    <div className="space-y-6">
      <SlideIn direction="up" delay={0.2}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas de Inventario
            </CardTitle>
            <CardDescription>
              Configuración de notificaciones de inventario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dias_agotamiento">
                  Días Antes de Agotamiento
                </Label>
                <Input
                  id="dias_agotamiento"
                  type="number"
                  value={config.inventario.dias_antes_agotamiento}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      inventario: {
                        ...config.inventario,
                        dias_antes_agotamiento: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="porcentaje_stock">
                  % Stock Mínimo para Alerta
                </Label>
                <Input
                  id="porcentaje_stock"
                  type="number"
                  value={config.inventario.porcentaje_stock_minimo_alerta}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      inventario: {
                        ...config.inventario,
                        porcentaje_stock_minimo_alerta: parseInt(
                          e.target.value
                        ),
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dias_vencimiento">
                  Días Antes de Vencimiento
                </Label>
                <Input
                  id="dias_vencimiento"
                  type="number"
                  value={config.inventario.dias_antes_vencimiento}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      inventario: {
                        ...config.inventario,
                        dias_antes_vencimiento: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar Productos por Vencer</Label>
                <p className="text-sm text-gray-600">
                  Alertar sobre productos próximos a vencer
                </p>
              </div>
              <Switch
                checked={config.inventario.notificar_productos_proximos_vencer}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    inventario: {
                      ...config.inventario,
                      notificar_productos_proximos_vencer: checked,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      <SlideIn direction="up" delay={0.3}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Alertas de Mesas y Cocina</CardTitle>
            <CardDescription>
              Configuración de alertas operativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Mesas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minutos_sin_atencion">
                    Minutos sin Atención
                  </Label>
                  <Input
                    id="minutos_sin_atencion"
                    type="number"
                    value={config.mesas.minutos_sin_atencion}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        mesas: {
                          ...config.mesas,
                          minutos_sin_atencion: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ocupacion_alta">% Ocupación Alta</Label>
                  <Input
                    id="ocupacion_alta"
                    type="number"
                    value={config.mesas.porcentaje_ocupacion_alta}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        mesas: {
                          ...config.mesas,
                          porcentaje_ocupacion_alta: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificar Mesa Disponible</Label>
                <Switch
                  checked={config.mesas.notificar_mesa_disponible}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...config,
                      mesas: {
                        ...config.mesas,
                        notificar_mesa_disponible: checked,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Cocina</h4>
              <div>
                <Label htmlFor="tiempo_excedido">
                  Minutos de Preparación Excedido
                </Label>
                <Input
                  id="tiempo_excedido"
                  type="number"
                  value={config.cocina.minutos_tiempo_preparacion_excedido}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      cocina: {
                        ...config.cocina,
                        minutos_tiempo_preparacion_excedido: parseInt(
                          e.target.value
                        ),
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Notificar Orden Lista</Label>
                  <Switch
                    checked={config.cocina.notificar_orden_lista}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...config,
                        cocina: {
                          ...config.cocina,
                          notificar_orden_lista: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notificar Orden Retrasada</Label>
                  <Switch
                    checked={config.cocina.notificar_orden_retrasada}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...config,
                        cocina: {
                          ...config.cocina,
                          notificar_orden_retrasada: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Reservaciones</h4>
              <div>
                <Label htmlFor="minutos_notificar">
                  Minutos Antes de Notificar
                </Label>
                <Input
                  id="minutos_notificar"
                  type="number"
                  value={config.reservaciones.minutos_antes_notificar}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      reservaciones: {
                        ...config.reservaciones,
                        minutos_antes_notificar: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificar Reservación Próxima</Label>
                <Switch
                  checked={config.reservaciones.notificar_reservacion_proxima}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...config,
                      reservaciones: {
                        ...config.reservaciones,
                        notificar_reservacion_proxima: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
};
