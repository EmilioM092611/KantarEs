// app/(dashboard)/sistema/components/ConfiguracionGeneral.tsx
// Componente para la configuración general del restaurante

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { ConfiguracionGeneral } from "@/lib/api/configuracion";

interface ConfiguracionGeneralProps {
  config: ConfiguracionGeneral;
  onChange: (config: ConfiguracionGeneral) => void;
}

export const ConfiguracionGeneralComponent = ({
  config,
  onChange,
}: ConfiguracionGeneralProps) => {
  return (
    <div className="space-y-6">
      <SlideIn direction="up" delay={0.2}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Información del Restaurante
            </CardTitle>
            <CardDescription>
              Configuración básica del establecimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre_restaurante">
                  Nombre del Restaurante
                </Label>
                <Input
                  id="nombre_restaurante"
                  value={config.nombre_restaurante}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      nombre_restaurante: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={config.telefono}
                  onChange={(e) =>
                    onChange({ ...config, telefono: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={config.direccion}
                onChange={(e) =>
                  onChange({ ...config, direccion: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) =>
                    onChange({ ...config, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={config.rfc}
                  onChange={(e) => onChange({ ...config, rfc: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={config.slogan || ""}
                  onChange={(e) =>
                    onChange({ ...config, slogan: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  value={config.sitio_web || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      sitio_web: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      <SlideIn direction="up" delay={0.3}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Redes Sociales</CardTitle>
            <CardDescription>
              Enlaces a perfiles en redes sociales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={config.redes_sociales?.facebook || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      redes_sociales: {
                        ...config.redes_sociales,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={config.redes_sociales?.instagram || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      redes_sociales: {
                        ...config.redes_sociales,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  value={config.redes_sociales?.twitter || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      redes_sociales: {
                        ...config.redes_sociales,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={config.redes_sociales?.tiktok || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      redes_sociales: {
                        ...config.redes_sociales,
                        tiktok: e.target.value,
                      },
                    })
                  }
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
};
