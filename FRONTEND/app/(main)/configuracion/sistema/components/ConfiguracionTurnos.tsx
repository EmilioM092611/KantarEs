// app/(dashboard)/sistema/components/ConfiguracionTurnos.tsx
// Componente para la configuración de turnos (CON SELECTOR DE DÍAS CORREGIDO)

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Trash2 } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionTurnos } from "@/lib/api/configuracion";

interface ConfiguracionTurnosProps {
  config: ConfiguracionTurnos;
  onChange: (config: ConfiguracionTurnos) => void;
  onAgregarTurno: () => void;
  onEliminarTurno: (index: number) => void;
}

const DIAS_SEMANA = [
  { label: "Dom", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mié", value: 3 },
  { label: "Jue", value: 4 },
  { label: "Vie", value: 5 },
  { label: "Sáb", value: 6 },
];

export const ConfiguracionTurnosComponent = ({
  config,
  onChange,
  onAgregarTurno,
  onEliminarTurno,
}: ConfiguracionTurnosProps) => {
  const toggleDiaSemana = (turnoIndex: number, diaValue: number) => {
    const nuevosTurnos = [...config.turnos];
    const dias = [...nuevosTurnos[turnoIndex].dias_semana];

    if (dias.includes(diaValue)) {
      // Remover día
      nuevosTurnos[turnoIndex].dias_semana = dias.filter((d) => d !== diaValue);
    } else {
      // Agregar día y ordenar
      nuevosTurnos[turnoIndex].dias_semana = [...dias, diaValue].sort(
        (a, b) => a - b
      );
    }

    onChange({ ...config, turnos: nuevosTurnos });
  };

  return (
    <SlideIn direction="up" delay={0.2}>
      <Card className="transition-smooth hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Turnos
              </CardTitle>
              <CardDescription>
                Configuración de turnos de trabajo
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAgregarTurno}
              className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Turno
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {config.turnos.map((turno, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-3 relative"
              >
                {/* Botón de eliminar (solo si hay más de 1 turno) */}
                {config.turnos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onEliminarTurno(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex items-center justify-between pr-10">
                  <Input
                    value={turno.nombre}
                    onChange={(e) => {
                      const nuevosTurnos = [...config.turnos];
                      nuevosTurnos[index].nombre = e.target.value;
                      onChange({
                        ...config,
                        turnos: nuevosTurnos,
                      });
                    }}
                    placeholder="Nombre del turno"
                    className="max-w-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={turno.activo}
                      onCheckedChange={(checked) => {
                        const nuevosTurnos = [...config.turnos];
                        nuevosTurnos[index].activo = checked;
                        onChange({
                          ...config,
                          turnos: nuevosTurnos,
                        });
                      }}
                    />
                    <Label className="text-sm">
                      {turno.activo ? "Activo" : "Inactivo"}
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Hora Inicio</Label>
                    <Input
                      type="time"
                      value={turno.hora_inicio}
                      onChange={(e) => {
                        const nuevosTurnos = [...config.turnos];
                        nuevosTurnos[index].hora_inicio = e.target.value;
                        onChange({
                          ...config,
                          turnos: nuevosTurnos,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Hora Fin</Label>
                    <Input
                      type="time"
                      value={turno.hora_fin}
                      onChange={(e) => {
                        const nuevosTurnos = [...config.turnos];
                        nuevosTurnos[index].hora_fin = e.target.value;
                        onChange({
                          ...config,
                          turnos: nuevosTurnos,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* ✅ SELECTOR DE DÍAS DE LA SEMANA (CORREGIDO) */}
                <div>
                  <Label>Días de la Semana</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DIAS_SEMANA.map((dia) => (
                      <Button
                        key={dia.value}
                        type="button"
                        variant={
                          turno.dias_semana.includes(dia.value)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={
                          turno.dias_semana.includes(dia.value)
                            ? "bg-red-600 hover:bg-red-700"
                            : ""
                        }
                        onClick={() => toggleDiaSemana(index, dia.value)}
                      >
                        {dia.label}
                      </Button>
                    ))}
                  </div>
                  {turno.dias_semana.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Selecciona al menos un día
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={turno.requiere_corte}
                    onCheckedChange={(checked) => {
                      const nuevosTurnos = [...config.turnos];
                      nuevosTurnos[index].requiere_corte = checked;
                      onChange({
                        ...config,
                        turnos: nuevosTurnos,
                      });
                    }}
                  />
                  <Label>Requiere Corte de Caja</Label>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Traslape de Turnos</Label>
                <p className="text-sm text-gray-600">
                  Turnos pueden solaparse en horario
                </p>
              </div>
              <Switch
                checked={config.permitir_traslape_turnos}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    permitir_traslape_turnos: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Requiere Corte Entre Turnos</Label>
                <p className="text-sm text-gray-600">
                  Obligar corte de caja al cambiar turno
                </p>
              </div>
              <Switch
                checked={config.requiere_corte_entre_turnos}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    requiere_corte_entre_turnos: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </SlideIn>
  );
};
