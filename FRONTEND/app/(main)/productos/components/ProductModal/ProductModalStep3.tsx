import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Package, Clock, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { Producto } from "@/lib/api/productos";

interface ProductModalStep3Props {
  producto: Partial<Producto>;
  onProductoChange: (producto: Partial<Producto>) => void;
}

export function ProductModalStep3({
  producto,
  onProductoChange,
}: ProductModalStep3Props) {
  return (
    <div className="space-y-6">
      {/* Stock y Tiempo de Preparación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="stock"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-blue-600" />
            Stock inicial *
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={producto.stock !== undefined ? producto.stock : ""}
            onChange={(e) =>
              onProductoChange({
                ...producto,
                stock: parseInt(e.target.value) || 0,
              })
            }
            className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            placeholder="0"
          />
          <p className="text-xs text-gray-500">
            Cantidad inicial disponible en inventario
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="tiempo_prep"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            Tiempo de preparación (min) *
          </Label>
          <Input
            id="tiempo_prep"
            type="number"
            min="0"
            value={
              producto.tiempo_prep !== undefined ? producto.tiempo_prep : ""
            }
            onChange={(e) =>
              onProductoChange({
                ...producto,
                tiempo_prep: parseInt(e.target.value) || 0,
              })
            }
            className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            placeholder="0"
          />
          <p className="text-xs text-gray-500">
            Tiempo estimado para preparar el producto
          </p>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {producto.disponible ? (
              <Eye className="w-6 h-6 text-emerald-600" />
            ) : (
              <EyeOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  Disponibilidad del producto
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {producto.disponible
                    ? "Este producto está disponible para venta"
                    : "Este producto no está disponible para venta"}
                </p>
              </div>
              <Switch
                id="disponible"
                checked={producto.disponible ?? true}
                onCheckedChange={(checked) =>
                  onProductoChange({ ...producto, disponible: checked })
                }
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional sobre disponibilidad */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold text-blue-900">
              ¿Qué significa "Disponible"?
            </h5>
            <p className="text-sm text-blue-700 mt-1">
              Los productos marcados como disponibles aparecerán en el menú y
              los clientes podrán ordenarlos. Los productos no disponibles
              estarán ocultos temporalmente.
            </p>
          </div>
        </div>

        {/* Alerta de stock bajo */}
        {producto.stock !== undefined && producto.stock < 5 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-amber-900">
                Stock bajo detectado
              </h5>
              <p className="text-sm text-amber-700 mt-1">
                El stock actual ({producto.stock} unidades) está por debajo del
                nivel recomendado. Considera reabastecer pronto para evitar
                quedarte sin inventario.
              </p>
            </div>
          </div>
        )}

        {/* Info de tiempo de preparación largo */}
        {producto.tiempo_prep !== undefined && producto.tiempo_prep > 30 && (
          <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-purple-900">
                Tiempo de preparación extendido
              </h5>
              <p className="text-sm text-purple-700 mt-1">
                Este producto requiere más de 30 minutos de preparación.
                Asegúrate de informar al cliente sobre el tiempo de espera.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen visual */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-white border-2 border-gray-200 rounded-xl">
        <div className="text-center">
          <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {producto.stock !== undefined ? producto.stock : 0}
          </p>
          <p className="text-xs text-gray-600 mt-1">Unidades en stock</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {producto.tiempo_prep !== undefined ? producto.tiempo_prep : 0}
          </p>
          <p className="text-xs text-gray-600 mt-1">Minutos de prep.</p>
        </div>
        <div className="text-center">
          {producto.disponible ? (
            <>
              <Eye className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-emerald-700">Disponible</p>
            </>
          ) : (
            <>
              <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-500">No disponible</p>
            </>
          )}
          <p className="text-xs text-gray-600 mt-1">Estado actual</p>
        </div>
      </div>
    </div>
  );
}
