// app/(dashboard)/sistema/components/ConfiguracionFolios.tsx
// Componente para la configuración de folios

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
import { FileText } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionFolios } from "@/lib/api/configuracion";

interface ConfiguracionFoliosProps {
  config: ConfiguracionFolios;
  onChange: (config: ConfiguracionFolios) => void;
}

export const ConfiguracionFoliosComponent = ({
  config,
  onChange,
}: ConfiguracionFoliosProps) => {
  return (
    <SlideIn direction="up" delay={0.2}>
      <Card className="transition-smooth hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Prefijos y Consecutivos
          </CardTitle>
          <CardDescription>
            Configuración de folios para documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prefijo_orden">Prefijo Órdenes</Label>
              <Input
                id="prefijo_orden"
                value={config.prefijo_orden}
                onChange={(e) =>
                  onChange({
                    ...config,
                    prefijo_orden: e.target.value,
                  })
                }
                placeholder="ORD"
              />
            </div>
            <div>
              <Label htmlFor="prefijo_pago">Prefijo Pagos</Label>
              <Input
                id="prefijo_pago"
                value={config.prefijo_pago}
                onChange={(e) =>
                  onChange({
                    ...config,
                    prefijo_pago: e.target.value,
                  })
                }
                placeholder="PAY"
              />
            </div>
            <div>
              <Label htmlFor="prefijo_corte">Prefijo Cortes</Label>
              <Input
                id="prefijo_corte"
                value={config.prefijo_corte}
                onChange={(e) =>
                  onChange({
                    ...config,
                    prefijo_corte: e.target.value,
                  })
                }
                placeholder="CORTE"
              />
            </div>
            <div>
              <Label htmlFor="prefijo_compra">Prefijo Compras</Label>
              <Input
                id="prefijo_compra"
                value={config.prefijo_compra}
                onChange={(e) =>
                  onChange({
                    ...config,
                    prefijo_compra: e.target.value,
                  })
                }
                placeholder="COMP"
              />
            </div>
            <div>
              <Label htmlFor="prefijo_factura">Prefijo Facturas</Label>
              <Input
                id="prefijo_factura"
                value={config.prefijo_factura}
                onChange={(e) =>
                  onChange({
                    ...config,
                    prefijo_factura: e.target.value,
                  })
                }
                placeholder="FACT"
              />
            </div>
            <div>
              <Label htmlFor="longitud_consecutivo">Longitud Consecutivo</Label>
              <Input
                id="longitud_consecutivo"
                type="number"
                value={config.longitud_consecutivo}
                onChange={(e) =>
                  onChange({
                    ...config,
                    longitud_consecutivo: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Reinicio de Consecutivos</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reiniciar Diario</Label>
                  <p className="text-sm text-gray-600">
                    Consecutivos se reinician cada día
                  </p>
                </div>
                <Switch
                  checked={config.reiniciar_diario}
                  onCheckedChange={(checked) =>
                    onChange({ ...config, reiniciar_diario: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reiniciar Mensual</Label>
                  <p className="text-sm text-gray-600">
                    Consecutivos se reinician cada mes
                  </p>
                </div>
                <Switch
                  checked={config.reiniciar_mensual}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...config,
                      reiniciar_mensual: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reiniciar Anual</Label>
                  <p className="text-sm text-gray-600">
                    Consecutivos se reinician cada año
                  </p>
                </div>
                <Switch
                  checked={config.reiniciar_anual}
                  onCheckedChange={(checked) =>
                    onChange({ ...config, reiniciar_anual: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SlideIn>
  );
};
