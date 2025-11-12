import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, Percent } from "lucide-react";
import type { Producto } from "@/lib/api/productos";

interface ProductModalStep2Props {
  producto: Partial<Producto>;
  onProductoChange: (producto: Partial<Producto>) => void;
}

export function ProductModalStep2({
  producto,
  onProductoChange,
}: ProductModalStep2Props) {
  // Calcular margen
  const calcularMargen = () => {
    if (producto.precio && producto.costo && producto.precio > 0) {
      return (
        ((producto.precio - producto.costo) / producto.precio) *
        100
      ).toFixed(1);
    }
    return "0.0";
  };

  // Calcular utilidad
  const calcularUtilidad = () => {
    if (producto.precio && producto.costo) {
      return (producto.precio - producto.costo).toFixed(2);
    }
    return "0.00";
  };

  return (
    <div className="space-y-6">
      {/* Precio y Costo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="precio"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-red-600" />
            Precio de venta *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              value={producto.precio || ""}
              onChange={(e) =>
                onProductoChange({
                  ...producto,
                  precio: parseFloat(e.target.value) || 0,
                })
              }
              className="pl-8 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500">
            Precio al que se venderá el producto al cliente
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="costo"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-amber-600" />
            Costo del producto *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <Input
              id="costo"
              type="number"
              step="0.01"
              min="0"
              value={producto.costo || ""}
              onChange={(e) =>
                onProductoChange({
                  ...producto,
                  costo: parseFloat(e.target.value) || 0,
                })
              }
              className="pl-8 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500">
            Costo de producción o adquisición del producto
          </p>
        </div>
      </div>

      {/* Indicadores calculados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        {/* Margen de ganancia */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Margen de ganancia
          </Label>
          <div className="relative">
            <Input
              type="text"
              value={`${calcularMargen()}%`}
              disabled
              className="bg-white font-bold text-lg text-emerald-700 border-emerald-200"
            />
          </div>
          <p className="text-xs text-gray-500">
            Porcentaje de ganancia sobre el precio de venta
          </p>
        </div>

        {/* Utilidad bruta */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Utilidad bruta
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <Input
              type="text"
              value={calcularUtilidad()}
              disabled
              className="pl-8 bg-white font-bold text-lg text-blue-700 border-blue-200"
            />
          </div>
          <p className="text-xs text-gray-500">
            Ganancia por cada unidad vendida
          </p>
        </div>
      </div>

      {/* Alerta de margen bajo */}
      {producto.precio &&
        producto.costo &&
        parseFloat(calcularMargen()) < 20 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Margen de ganancia bajo
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                El margen de ganancia actual ({calcularMargen()}%) es menor al
                recomendado. Considera ajustar el precio de venta o negociar el
                costo.
              </p>
            </div>
          </div>
        )}

      {/* Alerta de precio menor al costo */}
      {producto.precio &&
        producto.costo &&
        producto.precio < producto.costo && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-900">
                ¡Precio no rentable!
              </h4>
              <p className="text-sm text-red-700 mt-1">
                El precio de venta es menor al costo del producto. Esto generará
                pérdidas en cada venta.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
