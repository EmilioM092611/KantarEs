// FRONTEND/lib/api/productos.ts
// Servicio para gestión de productos

import { apiClient } from "./client";

// ==================== TIPOS DEL BACKEND ====================

export interface ProductoBackend {
  id_producto: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  id_categoria: number;
  id_unidad_medida: number;
  precio_venta: number;
  costo_promedio: number | null;
  iva_tasa: number;
  disponible: boolean;
  es_vendible: boolean;
  tiempo_preparacion_min: number | null;
  calorias: number | null;
  imagen_url: string | null;
  alergenos: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categorias?: {
    id_categoria: number;
    nombre: string;
    descripcion: string | null;
  };
  unidades_medida?: {
    id_unidad: number;
    nombre: string;
    abreviatura: string;
  };
  inventario?: {
    id_inventario: number;
    id_producto: number;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number | null;
    ubicacion_almacen: string | null;
  }[];
}

export interface RespuestaListaProductos {
  success: boolean;
  data: ProductoBackend[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EstadisticasProductos {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  productosBajoStock: number;
  productosPorCategoria: {
    id: number;
    nombre: string;
    cantidad: number;
  }[];
}

// ==================== TIPOS DEL FRONTEND ====================

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  categoria_id: number;
  imagen: string;
  disponible: boolean;
  tiempo_prep: number;
  stock: number;
  stock_minimo?: number;
  stock_maximo?: number;
  costo: number;
  margen: number;
  ingredientes: string[];
  alergenos: string[];
  calorias?: number;
  fecha_creacion: string;
  popular?: boolean;
  picante?: boolean;
  vegetariano?: boolean;
  especialidad?: boolean;
  codigo: string;
  sku: string;
  unidad_medida: string;
  unidad_medida_id: number;
}

// ==================== DTOs PARA CREAR/ACTUALIZAR ====================

export interface CreateProductoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  id_tipo_producto: number;
  precio_venta: number;
  costo?: number;
  iva?: number;
  id_unidad_medida: number;
  stock_minimo?: number;
  stock_maximo?: number;
  ubicacion_almacen?: string;
  imagen_url?: string;
  disponible_venta?: boolean;
  tiempo_preparacion_min?: number;
  calorias?: number;
  ingredientes?: string[];
  alergenos?: string[];
}

export interface UpdateProductoDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  id_tipo_producto?: number;
  precio_venta?: number;
  costo?: number;
  iva?: number;
  id_unidad_medida?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  ubicacion_almacen?: string;
  imagen_url?: string;
  disponible_venta?: boolean;
  tiempo_preparacion_min?: number;
  calorias?: number;
  ingredientes?: string[];
  alergenos?: string[];
}

export interface QueryProductosDto {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: number;
  activo?: boolean;
  disponible?: boolean;
  ordenarPor?: "nombre" | "precio" | "codigo" | "stock" | "createdAt";
  orden?: "asc" | "desc";
}

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

export function transformarProducto(producto: ProductoBackend): Producto {
  const stock = producto.inventario?.[0]?.stock_actual
    ? Number(producto.inventario[0].stock_actual)
    : 0;
  const stock_minimo = producto.inventario?.[0]?.stock_minimo
    ? Number(producto.inventario[0].stock_minimo)
    : undefined;
  const stock_maximo = producto.inventario?.[0]?.stock_maximo
    ? Number(producto.inventario[0].stock_maximo)
    : undefined;

  const precio = Number(producto.precio_venta);
  const costo = producto.costo_promedio ? Number(producto.costo_promedio) : 0;
  const margen = precio > 0 ? ((precio - costo) / precio) * 100 : 0;

  const alergenos = producto.alergenos
    ? producto.alergenos.split(",").map((a) => a.trim())
    : [];

  return {
    id: producto.id_producto,
    nombre: producto.nombre,
    descripcion: producto.descripcion || "",
    precio: precio,
    categoria: producto.categorias?.nombre || "Sin categoría",
    categoria_id: producto.id_categoria,
    imagen: producto.imagen_url || "/placeholder-producto.jpg",
    disponible: producto.disponible && producto.es_vendible,
    tiempo_prep: producto.tiempo_preparacion_min || 0,
    stock: stock,
    stock_minimo,
    stock_maximo,
    costo: costo,
    margen: Number(margen.toFixed(1)),
    ingredientes: [],
    alergenos: alergenos,
    calorias: producto.calorias || undefined,
    fecha_creacion: new Date(producto.created_at).toISOString().split("T")[0],
    codigo: producto.sku,
    sku: producto.sku,
    unidad_medida: producto.unidades_medida?.abreviatura || "ud",
    unidad_medida_id: producto.id_unidad_medida,
  };
}

export function prepararCreateProducto(
  data: Partial<Producto>
): CreateProductoDto {
  return {
    codigo: data.sku || data.codigo || `PROD-${Date.now()}`,
    nombre: data.nombre || "",
    descripcion: data.descripcion,
    id_tipo_producto: data.categoria_id || 1,
    precio_venta: data.precio || 0,
    costo: data.costo,
    iva: 16,
    id_unidad_medida: data.unidad_medida_id || 1,
    stock_minimo: data.stock_minimo,
    stock_maximo: data.stock_maximo,
    imagen_url: (data as any).imagen || data.imagen,
    disponible_venta: data.disponible ?? true,
    tiempo_preparacion_min: data.tiempo_prep,
    calorias: data.calorias,
    ingredientes: data.ingredientes,
    alergenos: data.alergenos,
  };
}

export function prepararUpdateProducto(
  data: Partial<Producto>
): UpdateProductoDto {
  const dto: UpdateProductoDto = {};

  if (data.sku !== undefined) dto.codigo = data.sku;
  else if (data.codigo !== undefined) dto.codigo = data.codigo;

  if (data.nombre !== undefined) dto.nombre = data.nombre;
  if (data.descripcion !== undefined) dto.descripcion = data.descripcion;
  if (data.categoria_id !== undefined) dto.id_tipo_producto = data.categoria_id;
  if (data.precio !== undefined) dto.precio_venta = data.precio;
  if (data.costo !== undefined) dto.costo = data.costo;
  if (data.unidad_medida_id !== undefined)
    dto.id_unidad_medida = data.unidad_medida_id;

  if ((data as any).imagen !== undefined) {
    dto.imagen_url = (data as any).imagen;
  } else if (data.imagen !== undefined) {
    dto.imagen_url = data.imagen;
  }

  if (data.disponible !== undefined) dto.disponible_venta = data.disponible;
  if (data.tiempo_prep !== undefined)
    dto.tiempo_preparacion_min = data.tiempo_prep;
  if (data.calorias !== undefined) dto.calorias = data.calorias;
  if (data.ingredientes !== undefined) dto.ingredientes = data.ingredientes;
  if (data.alergenos !== undefined) dto.alergenos = data.alergenos;
  if (data.stock_minimo !== undefined) dto.stock_minimo = data.stock_minimo;
  if (data.stock_maximo !== undefined) dto.stock_maximo = data.stock_maximo;

  return dto;
}

// ==================== SERVICIO DE PRODUCTOS ====================

class ProductosService {
  private readonly endpoint = "/productos";

  async obtenerProductos(query?: QueryProductosDto): Promise<{
    productos: Producto[];
    meta: RespuestaListaProductos["meta"];
  }> {
    try {
      const response = await apiClient.get<RespuestaListaProductos>(
        this.endpoint,
        query
      );

      const productos = response.data.map(transformarProducto);

      return {
        productos,
        meta: response.meta,
      };
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }

  async obtenerProductosActivos(query?: QueryProductosDto): Promise<{
    productos: Producto[];
    meta: RespuestaListaProductos["meta"];
  }> {
    try {
      const response = await apiClient.get<RespuestaListaProductos>(
        `${this.endpoint}/activos`,
        query
      );

      const productos = response.data.map(transformarProducto);

      return {
        productos,
        meta: response.meta,
      };
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      throw error;
    }
  }

  async buscarProductos(searchTerm: string): Promise<Producto[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ProductoBackend[];
      }>(`${this.endpoint}/buscar`, { q: searchTerm });

      return response.data.map(transformarProducto);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      throw error;
    }
  }

  async obtenerProductosPorCategoria(
    categoriaId: number,
    query?: QueryProductosDto
  ): Promise<{
    productos: Producto[];
    meta: RespuestaListaProductos["meta"];
  }> {
    try {
      const response = await apiClient.get<RespuestaListaProductos>(
        `${this.endpoint}/por-categoria/${categoriaId}`,
        query
      );

      const productos = response.data.map(transformarProducto);

      return {
        productos,
        meta: response.meta,
      };
    } catch (error) {
      console.error(
        `Error al obtener productos de la categoría ${categoriaId}:`,
        error
      );
      throw error;
    }
  }

  async obtenerProducto(id: number): Promise<Producto> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ProductoBackend;
      }>(`${this.endpoint}/${id}`);

      return transformarProducto(response.data);
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  }

  async crearProducto(data: Partial<Producto>): Promise<Producto> {
    try {
      const dto = prepararCreateProducto(data);

      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: ProductoBackend;
      }>(this.endpoint, dto);

      return transformarProducto(response.data);
    } catch (error: any) {
      console.error("Error al crear producto:", error);

      if (error.message.includes("409")) {
        throw new Error("El código del producto ya está en uso");
      } else if (error.message.includes("400")) {
        throw new Error("Datos inválidos. Verifica todos los campos");
      }

      throw error;
    }
  }

  async actualizarProducto(
    id: number,
    data: Partial<Producto>
  ): Promise<Producto> {
    try {
      const dto = prepararUpdateProducto(data);

      const response = await apiClient.patch<{
        success: boolean;
        message: string;
        data: ProductoBackend;
      }>(`${this.endpoint}/${id}`, dto);

      return transformarProducto(response.data);
    } catch (error: any) {
      console.error(`Error al actualizar producto ${id}:`, error);

      if (error.message.includes("404")) {
        throw new Error("Producto no encontrado");
      } else if (error.message.includes("409")) {
        throw new Error("El código del producto ya está en uso");
      }

      throw error;
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    try {
      await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  }

  async activarProducto(id: number): Promise<Producto> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: ProductoBackend;
      }>(`${this.endpoint}/${id}/activar`);

      return transformarProducto(response.data);
    } catch (error) {
      console.error(`Error al activar producto ${id}:`, error);
      throw error;
    }
  }

  async desactivarProducto(id: number): Promise<Producto> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: ProductoBackend;
      }>(`${this.endpoint}/${id}/desactivar`);

      return transformarProducto(response.data);
    } catch (error) {
      console.error(`Error al desactivar producto ${id}:`, error);
      throw error;
    }
  }

  async toggleDisponibilidad(
    id: number,
    disponible: boolean
  ): Promise<Producto> {
    if (disponible) {
      return this.activarProducto(id);
    } else {
      return this.desactivarProducto(id);
    }
  }

  async obtenerEstadisticas(): Promise<EstadisticasProductos> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: EstadisticasProductos;
      }>(`${this.endpoint}/estadisticas`);

      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de productos:", error);
      throw error;
    }
  }

  async duplicarProducto(id: number): Promise<Producto> {
    try {
      const productoOriginal = await this.obtenerProducto(id);

      const productoDuplicado: Partial<Producto> = {
        ...productoOriginal,
        nombre: `${productoOriginal.nombre} (Copia)`,
        sku: `${productoOriginal.sku}-COPY-${Date.now()}`,
        codigo: `${productoOriginal.codigo}-COPY-${Date.now()}`,
      };

      delete (productoDuplicado as any).id;

      return await this.crearProducto(productoDuplicado);
    } catch (error) {
      console.error(`Error al duplicar producto ${id}:`, error);
      throw error;
    }
  }
}

export const productosService = new ProductosService();
