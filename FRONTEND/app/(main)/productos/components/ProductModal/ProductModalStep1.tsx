import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X, Edit, Loader2, ImageOff } from "lucide-react";
import type { Producto } from "@/lib/api/productos";
import type { UnidadMedida } from "@/lib/api/unidades-medida";

interface ProductModalStep1Props {
  producto: Partial<Producto>;
  categorias: any[];
  unidadesMedida: UnidadMedida[];
  onProductoChange: (producto: Partial<Producto>) => void;
  onImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEliminarImagen: () => void;
  imagenPreview: string | null;
  subiendoImagen: boolean;
}

export function ProductModalStep1({
  producto,
  categorias,
  unidadesMedida,
  onProductoChange,
  onImagenChange,
  onEliminarImagen,
  imagenPreview,
  subiendoImagen,
}: ProductModalStep1Props) {
  return (
    <div className="space-y-6">
      {/* Nombre y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
            Nombre del producto *
          </Label>
          <Input
            id="nombre"
            value={producto.nombre || ""}
            onChange={(e) =>
              onProductoChange({ ...producto, nombre: e.target.value })
            }
            className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            placeholder="Ej: Tacos al Pastor"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="categoria"
            className="text-sm font-medium text-gray-700"
          >
            Categoría *
          </Label>
          <Select
            value={producto.categoria_id?.toString() || ""}
            onValueChange={(value) =>
              onProductoChange({
                ...producto,
                categoria_id: parseInt(value),
              })
            }
          >
            <SelectTrigger className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-white/95 border border-gray-200 shadow-lg rounded-xl">
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SKU y Unidad de Medida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
            SKU (Código del producto)
          </Label>
          <Input
            id="sku"
            value={producto.sku || ""}
            onChange={(e) =>
              onProductoChange({ ...producto, sku: e.target.value })
            }
            className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
            placeholder="Ej: TACO-001"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="unidad_medida"
            className="text-sm font-medium text-gray-700"
          >
            Unidad de medida *
          </Label>
          <Select
            value={producto.unidad_medida_id?.toString() || ""}
            onValueChange={(value) =>
              onProductoChange({
                ...producto,
                unidad_medida_id: parseInt(value),
              })
            }
          >
            <SelectTrigger className="focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all">
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-white/95 border border-gray-200 shadow-lg rounded-xl">
              {unidadesMedida.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.id.toString()}>
                  {unidad.nombre} ({unidad.abreviatura})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Unidad en la que se mide/vende el producto
          </p>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label
          htmlFor="descripcion"
          className="text-sm font-medium text-gray-700"
        >
          Descripción
        </Label>
        <Textarea
          id="descripcion"
          value={producto.descripcion || ""}
          onChange={(e) =>
            onProductoChange({ ...producto, descripcion: e.target.value })
          }
          rows={3}
          className="resize-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
          placeholder="Describe las características del producto..."
        />
      </div>

      {/* Upload de imagen */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Imagen del producto
        </Label>
        <div className="mt-2">
          {imagenPreview ? (
            <div className="relative group">
              <div className="relative w-full h-56 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    size="lg"
                    className="bg-white/95 hover:bg-white text-gray-900 shadow-xl hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() =>
                      document.getElementById("imagen-upload")?.click()
                    }
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Cambiar
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-xl hover:shadow-2xl hover:shadow-red-500/50 border-2 border-red-400/50 transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={onEliminarImagen}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="imagen-upload"
              className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o
                  arrastra una imagen
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP (MAX. 5MB)
                </p>
              </div>
            </label>
          )}
          <input
            id="imagen-upload"
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onImagenChange}
            disabled={subiendoImagen}
          />
          {subiendoImagen && (
            <div className="flex items-center justify-center mt-3 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Procesando imagen...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
