// app/(dashboard)/sistema/components/ConfiguracionFiscal.tsx
// Componente para la configuración fiscal

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
import { DollarSign } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionFiscal } from "@/lib/api/configuracion";

interface ConfiguracionFiscalProps {
  config: ConfiguracionFiscal;
  onChange: (config: ConfiguracionFiscal) => void;
}

export const ConfiguracionFiscalComponent = ({
  config,
  onChange,
}: ConfiguracionFiscalProps) => {
  return (
    <div className="space-y-6">
      <SlideIn direction="up" delay={0.2}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Impuestos
            </CardTitle>
            <CardDescription>Configuración de IVA e IEPS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iva">Tasa de IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  value={config.iva_tasa_default}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      iva_tasa_default: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ieps">Tasa de IEPS (%)</Label>
                <Input
                  id="ieps"
                  type="number"
                  value={config.ieps_tasa_default}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      ieps_tasa_default: parseFloat(e.target.value),
                    })
                  }
                  disabled={!config.ieps_aplicable}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>IEPS Aplicable</Label>
                <p className="text-sm text-gray-600">
                  Activar impuesto especial
                </p>
              </div>
              <Switch
                checked={config.ieps_aplicable}
                onCheckedChange={(checked) =>
                  onChange({ ...config, ieps_aplicable: checked })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
                <Input
                  id="regimen_fiscal"
                  value={config.regimen_fiscal}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      regimen_fiscal: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lugar_expedicion">Lugar de Expedición</Label>
                <Input
                  id="lugar_expedicion"
                  value={config.lugar_expedicion}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      lugar_expedicion: e.target.value,
                    })
                  }
                  placeholder="Código postal"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      <SlideIn direction="up" delay={0.3}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Propinas</CardTitle>
            <CardDescription>
              Configuración de propinas sugeridas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Porcentajes de Propina Sugeridos (%)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {config.propina_sugerida_porcentaje.map((porcentaje, index) => (
                  <Input
                    key={index}
                    type="number"
                    value={porcentaje}
                    onChange={(e) => {
                      const nuevos = [...config.propina_sugerida_porcentaje];
                      nuevos[index] = parseFloat(e.target.value);
                      onChange({
                        ...config,
                        propina_sugerida_porcentaje: nuevos,
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Propina Obligatoria</Label>
                <p className="text-sm text-gray-600">
                  Agregar propina automáticamente
                </p>
              </div>
              <Switch
                checked={config.propina_obligatoria}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    propina_obligatoria: checked,
                  })
                }
              />
            </div>

            {config.propina_obligatoria && (
              <div>
                <Label htmlFor="propina_obligatoria_tasa">
                  Tasa de Propina Obligatoria (%)
                </Label>
                <Input
                  id="propina_obligatoria_tasa"
                  type="number"
                  value={config.propina_tasa_obligatoria || 0}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      propina_tasa_obligatoria: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Incluir Propina en Factura</Label>
                <p className="text-sm text-gray-600">
                  Agregar propina al monto facturado
                </p>
              </div>
              <Switch
                checked={config.incluir_propina_en_factura}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    incluir_propina_en_factura: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
};
