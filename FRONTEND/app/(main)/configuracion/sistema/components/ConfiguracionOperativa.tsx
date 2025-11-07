// app/(dashboard)/sistema/components/ConfiguracionOperativa.tsx
// Componente para la configuración operativa del restaurante

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
import { Clock } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionOperativa } from "@/lib/api/configuracion";

interface ConfiguracionOperativaProps {
  config: ConfiguracionOperativa;
  onChange: (config: ConfiguracionOperativa) => void;
}

export const ConfiguracionOperativaComponent = ({
  config,
  onChange,
}: ConfiguracionOperativaProps) => {
  const ordenDias = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  return (
    <div className="space-y-6">
      <SlideIn direction="up" delay={0.2}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horarios de Operación
            </CardTitle>
            <CardDescription>
              Configure los horarios de apertura y cierre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ordenDias.map((dia) => {
              const horario = config.horarios[dia];
              if (!horario) return null;

              return (
                <div
                  key={dia}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2 w-32">
                    <Switch
                      checked={!horario.cerrado}
                      onCheckedChange={(checked) =>
                        onChange({
                          ...config,
                          horarios: {
                            ...config.horarios,
                            [dia]: { ...horario, cerrado: !checked },
                          },
                        })
                      }
                    />
                    <Label className="capitalize">{dia}</Label>
                  </div>
                  {!horario.cerrado && (
                    <>
                      <Input
                        type="time"
                        value={horario.apertura}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            horarios: {
                              ...config.horarios,
                              [dia]: {
                                ...horario,
                                apertura: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-32"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="time"
                        value={horario.cierre}
                        onChange={(e) =>
                          onChange({
                            ...config,
                            horarios: {
                              ...config.horarios,
                              [dia]: {
                                ...horario,
                                cierre: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-32"
                      />
                    </>
                  )}
                  {horario.cerrado && (
                    <span className="text-gray-500 italic">Cerrado</span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </SlideIn>

      <SlideIn direction="up" delay={0.3}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Configuración de Capacidad</CardTitle>
            <CardDescription>
              Parámetros operativos del restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacidad_maxima">
                  Capacidad Máxima (personas)
                </Label>
                <Input
                  id="capacidad_maxima"
                  type="number"
                  value={config.capacidad_maxima_personas}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      capacidad_maxima_personas: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tiempo_espera">
                  Tiempo de Espera Estimado (min)
                </Label>
                <Input
                  id="tiempo_espera"
                  type="number"
                  value={config.tiempo_espera_estimado}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      tiempo_espera_estimado: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="duracion_comida">
                  Duración Promedio Comida (min)
                </Label>
                <Input
                  id="duracion_comida"
                  type="number"
                  value={config.duracion_promedio_comida}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      duracion_promedio_comida: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="alerta_mesa">
                  Alerta Mesa sin Atención (min)
                </Label>
                <Input
                  id="alerta_mesa"
                  type="number"
                  value={config.alerta_tiempo_mesa_sin_atencion}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      alerta_tiempo_mesa_sin_atencion: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Reservaciones</Label>
                  <p className="text-sm text-gray-600">
                    Habilitar sistema de reservas
                  </p>
                </div>
                <Switch
                  checked={config.permite_reservaciones}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...config,
                      permite_reservaciones: checked,
                    })
                  }
                />
              </div>

              {config.permite_reservaciones && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="anticipacion_reserva">
                      Días de Anticipación para Reservar
                    </Label>
                    <Input
                      id="anticipacion_reserva"
                      type="number"
                      value={config.tiempo_anticipacion_reservaciones}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          tiempo_anticipacion_reservaciones: parseInt(
                            e.target.value
                          ),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gracia_reserva">
                      Tiempo de Gracia Reservación (min)
                    </Label>
                    <Input
                      id="gracia_reserva"
                      type="number"
                      value={config.tiempo_gracia_reservacion}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          tiempo_gracia_reservacion: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
};
