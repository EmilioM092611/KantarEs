"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/fade-in";
import { SlideIn } from "@/components/slide-in";
import { useToast } from "@/hooks/use-toast";
import { useProductos } from "@/hooks/use-productos";
import { useCategorias } from "./hooks/use-categorias";
import { useUnidadesMedida } from "./hooks/use-unidades-medida";
import { useProductModal } from "./hooks/use-product-modal";
import { useProductFilters } from "./hooks/use-product-filters";
import { useImageUpload } from "./hooks/use-image-upload";
import { useSuccessScreen } from "./hooks/use-success-screen";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import StatsGrid from "./components/StatsGrid";
import SearchAndFilters from "./components/SearchAndFilters";
import ProductCard from "./components/ProductCard";
import ProductTable from "./components/ProductTable";
import EmptyProducts from "./components/EmptyProducts";
import PaginationBar from "./components/PaginationBar";
import TabsSplit from "./components/TabsSplit";
import CategoryTable from "./components/CategoryTable";
import UnidadTable from "./components/UnidadTable";

import { ProductModal } from "./components/ProductModal/ProductModal";
import { CategoryModal } from "./components/ProductModal/CategoryModal";
import { UnidadMedidaModal } from "./components/ProductModal/UnidadMedidaModal";
import { SuccessScreenPremium } from "@/components/SuccessScreenPremium";
import { useState } from "react";

export default function ProductosPage() {
  const { toast } = useToast();
  const [tabActivo, setTabActivo] = useState<string>("todos");

  // Hook principal de productos
  const {
    productos,
    loading,
    page,
    totalPages,
    setPage,
    query,
    setQuery,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    duplicarProducto,
    toggleDisponibilidad,
  } = useProductos();

  // Hook de categorías
  const {
    categorias,
    modalOpen: modalCategoriaAbierto,
    editing: categoriaEditando,
    guardarCategoria,
    eliminarCategoria,
    openNew: abrirModalNuevaCategoria,
    openEdit: abrirModalEditarCategoria,
    closeModal: cerrarModalCategoria,
  } = useCategorias();

  // Hook de unidades de medida
  const {
    unidadesMedida,
    modalOpen: modalUnidadAbierto,
    editing: unidadEditando,
    guardarUnidad,
    eliminarUnidad,
    openNew: abrirModalNuevaUnidad,
    openEdit: abrirModalEditarUnidad,
    closeModal: cerrarModalUnidad,
  } = useUnidadesMedida();

  // Hook del modal de producto
  const productModal = useProductModal();

  // Hook de filtros
  const {
    busqueda,
    categoriaFiltro,
    vista,
    productosFiltrados,
    handleBusqueda,
    handleFiltroCategoria,
    handleVista,
  } = useProductFilters(productos);

  // Hook de imágenes
  const imageUpload = useImageUpload();

  // Hook de pantalla de éxito
  const successScreen = useSuccessScreen();

  // Handlers simplificados
  const handleAbrirNuevoProducto = () => {
    productModal.openNew(unidadesMedida);
    imageUpload.reset();
  };

  const handleAbrirEditarProducto = (producto: any) => {
    productModal.openEdit(producto);
    imageUpload.setPreview(producto.imagen || null);
  };

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await imageUpload.handleChange(e);
    if (imageUpload.preview) {
      productModal.setFormData({
        ...productModal.formData,
        imagen: imageUpload.preview,
      });
    }
  };

  const handleEliminarImagen = () => {
    imageUpload.remove();
    productModal.setFormData({
      ...productModal.formData,
      imagen: undefined,
    });
  };

  const handleSubmitModal = async () => {
    try {
      if (productModal.editingProduct) {
        await actualizarProducto(
          productModal.editingProduct.id,
          productModal.formData
        );
        successScreen.show(
          "¡Producto Actualizado!",
          `${productModal.formData.nombre} ha sido actualizado correctamente.`
        );
      } else {
        await crearProducto(productModal.formData);
        successScreen.show(
          "¡Producto Creado!",
          `${productModal.formData.nombre} ha sido creado correctamente.`
        );
      }
      productModal.close();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo guardar el producto. Intenta nuevamente.",
        variant: "error",
      });
    }
  };

  const handleEliminarProducto = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      await eliminarProducto(id);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto.",
        variant: "error",
      });
    }
  };

  const handleDuplicarProducto = async (producto: any) => {
    try {
      await duplicarProducto(producto.id);
      toast({
        title: "Producto duplicado",
        description: `Se ha creado una copia de ${producto.nombre}`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo duplicar el producto.",
        variant: "error",
      });
    }
  };

  const handleToggleDisponibilidad = async (id: number) => {
    try {
      await toggleDisponibilidad(id);
      toast({
        title: "Disponibilidad actualizada",
        description: "El estado del producto ha sido actualizado.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "No se pudo actualizar la disponibilidad.",
        variant: "error",
      });
    }
  };

  const handleSaveCategoria = async (data: any) => {
    try {
      await guardarCategoria(data);
      toast({
        title: categoriaEditando ? "Categoría actualizada" : "Categoría creada",
        description: `La categoría ${data.nombre} ha sido ${
          categoriaEditando ? "actualizada" : "creada"
        } correctamente.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la categoría.",
        variant: "error",
      });
    }
  };

  const handleEliminarCategoria = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      await eliminarCategoria(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría.",
        variant: "error",
      });
    }
  };

  const handleSaveUnidad = async (data: any) => {
    try {
      await guardarUnidad(data);
      toast({
        title: unidadEditando ? "Unidad actualizada" : "Unidad creada",
        description: `La unidad ${data.nombre} ha sido ${
          unidadEditando ? "actualizada" : "creada"
        } correctamente.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la unidad.",
        variant: "error",
      });
    }
  };

  const handleEliminarUnidad = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta unidad? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      await eliminarUnidad(id);
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la unidad.",
        variant: "error",
      });
    }
  };

  const handleBusquedaConQuery = (value: string) => {
    handleBusqueda(value);
    setQuery({ ...query, search: value, page: 1 });
    setPage(1);
  };

  const handleFiltroCategoriaConQuery = (value: string) => {
    handleFiltroCategoria(value);
    const categoriaId = value === "all" ? undefined : parseInt(value);
    setQuery({ ...query, categoria: categoriaId, page: 1 });
    setPage(1);
  };

  // Calcular stats
  const totalProductos = productos.length;
  const disponibles = productos.filter((p) => p.disponible).length;
  const stockBajo = productos.filter((p) => p.stock < 10).length;
  const totalCategorias = categorias.length;

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">
              Gestión de productos
            </h1>
            <p className="text-zinc-600">
              Administra tu catálogo de productos, categorías y unidades de
              medida
            </p>
          </div>
          <Button
            onClick={handleAbrirNuevoProducto}
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <SlideIn direction="up" delay={0.1}>
        <StatsGrid
          totalProductos={totalProductos}
          disponibles={disponibles}
          stockBajo={stockBajo}
          totalCategorias={totalCategorias}
        />
      </SlideIn>

      {/* Search and Filters - Solo se muestra en tabs de productos */}
      {["todos", "disponibles", "no_disponibles"].includes(tabActivo) && (
        <SlideIn direction="up" delay={0.2}>
          <SearchAndFilters
            busqueda={busqueda}
            onBusqueda={handleBusquedaConQuery}
            categoriaFiltro={categoriaFiltro}
            onCategoria={handleFiltroCategoriaConQuery}
            categorias={categorias}
            vista={vista}
            onVista={handleVista}
          />
        </SlideIn>
      )}

      {/* Tabs de gestión + productos */}
      <SlideIn direction="up" delay={0.3}>
        <Tabs value={tabActivo} onValueChange={setTabActivo}>
          <TabsSplit />

          {/* Categorías */}
          <TabsContent value="categorias" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-zinc-900">
                Categorías
              </h2>
              <Button
                onClick={abrirModalNuevaCategoria}
                className="bg-red-500 hover:bg-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CategoryTable
                categorias={categorias as any}
                onEditar={(c) => abrirModalEditarCategoria(c as any)}
                onEliminar={handleEliminarCategoria}
              />
            </motion.div>
          </TabsContent>

          {/* Unidades de medida */}
          <TabsContent value="unidades_medida" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-zinc-900">
                Unidades de Medida
              </h2>
              <Button
                onClick={abrirModalNuevaUnidad}
                className="bg-red-500 hover:bg-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Unidad
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <UnidadTable
                unidades={unidadesMedida as any}
                onEditar={(u) => abrirModalEditarUnidad(u as any)}
                onEliminar={handleEliminarUnidad}
              />
            </motion.div>
          </TabsContent>

          {/* Productos: TODOS */}
          <TabsContent value="todos" className="mt-6">
            <AnimatePresence mode="wait">
              {vista === "cards" ? (
                <motion.div
                  key="cards-todos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {productosFiltrados.map((p, idx) => (
                    <ProductCard
                      key={p.id}
                      producto={p as any}
                      index={idx}
                      onEditar={() => handleAbrirEditarProducto(p)}
                      onDuplicar={() => handleDuplicarProducto(p)}
                      onToggleDisponibilidad={handleToggleDisponibilidad}
                      onEliminar={handleEliminarProducto}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="table-todos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductTable
                    productos={productosFiltrados as any}
                    onEditar={handleAbrirEditarProducto}
                    onDuplicar={handleDuplicarProducto}
                    onToggleDisponibilidad={handleToggleDisponibilidad}
                    onEliminar={handleEliminarProducto}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {productosFiltrados.length === 0 && (
              <EmptyProducts
                message={
                  busqueda || categoriaFiltro
                    ? "No se encontraron productos con los filtros aplicados"
                    : "Comienza agregando tu primer producto al catálogo"
                }
                showCreate={!busqueda && !categoriaFiltro}
                onCreate={handleAbrirNuevoProducto}
              />
            )}
          </TabsContent>

          {/* Productos: DISPONIBLES */}
          <TabsContent value="disponibles" className="mt-6">
            <AnimatePresence mode="wait">
              {vista === "cards" ? (
                <motion.div
                  key="cards-disponibles"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {productosFiltrados
                    .filter((x) => x.disponible)
                    .map((p, idx) => (
                      <ProductCard
                        key={p.id}
                        producto={p as any}
                        index={idx}
                        onEditar={() => handleAbrirEditarProducto(p)}
                        onDuplicar={() => handleDuplicarProducto(p)}
                        onToggleDisponibilidad={handleToggleDisponibilidad}
                        onEliminar={handleEliminarProducto}
                      />
                    ))}
                </motion.div>
              ) : (
                <motion.div
                  key="table-disponibles"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductTable
                    productos={
                      productosFiltrados.filter((x) => x.disponible) as any
                    }
                    onEditar={handleAbrirEditarProducto}
                    onDuplicar={handleDuplicarProducto}
                    onToggleDisponibilidad={handleToggleDisponibilidad}
                    onEliminar={handleEliminarProducto}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Productos: NO DISPONIBLES */}
          <TabsContent value="no_disponibles" className="mt-6">
            <AnimatePresence mode="wait">
              {vista === "cards" ? (
                <motion.div
                  key="cards-no-disponibles"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {productosFiltrados
                    .filter((x) => !x.disponible)
                    .map((p, idx) => (
                      <ProductCard
                        key={p.id}
                        producto={p as any}
                        index={idx}
                        muted
                        onEditar={() => handleAbrirEditarProducto(p)}
                        onDuplicar={() => handleDuplicarProducto(p)}
                        onToggleDisponibilidad={handleToggleDisponibilidad}
                        onEliminar={handleEliminarProducto}
                      />
                    ))}
                </motion.div>
              ) : (
                <motion.div
                  key="table-no-disponibles"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductTable
                    productos={
                      productosFiltrados.filter((x) => !x.disponible) as any
                    }
                    onEditar={handleAbrirEditarProducto}
                    onDuplicar={handleDuplicarProducto}
                    onToggleDisponibilidad={handleToggleDisponibilidad}
                    onEliminar={handleEliminarProducto}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </SlideIn>

      {/* Paginación */}
      <SlideIn direction="up" delay={0.6}>
        <PaginationBar page={page} totalPages={totalPages} setPage={setPage} />
      </SlideIn>

      {/* Modales */}
      <ProductModal
        isOpen={productModal.isOpen}
        editingProduct={productModal.editingProduct}
        producto={productModal.formData}
        categorias={categorias}
        unidadesMedida={unidadesMedida}
        step={productModal.step}
        animationDirection={productModal.animationDirection}
        imagenPreview={imageUpload.preview}
        subiendoImagen={imageUpload.uploading}
        onOpenChange={productModal.setIsOpen}
        onProductoChange={productModal.setFormData}
        onStepChange={productModal.setStep}
        onAnimationDirectionChange={productModal.setAnimationDirection}
        onImagenChange={handleImagenChange}
        onEliminarImagen={handleEliminarImagen}
        onSave={handleSubmitModal}
      />

      <CategoryModal
        isOpen={modalCategoriaAbierto}
        editingCategory={categoriaEditando}
        onOpenChange={cerrarModalCategoria}
        onSave={handleSaveCategoria}
      />

      <UnidadMedidaModal
        isOpen={modalUnidadAbierto}
        editingUnidad={unidadEditando}
        onOpenChange={cerrarModalUnidad}
        onSave={handleSaveUnidad}
      />

      <SuccessScreenPremium
        isOpen={successScreen.isOpen}
        onClose={successScreen.hide}
        variant={productModal.editingProduct ? "edit" : "create"}
        title={successScreen.message.title}
        description={successScreen.message.description}
        userName={productModal.formData.nombre}
        autoCloseDelay={2500}
        accentColor="rgb(239, 68, 68)"
        showCloseButton={true}
      />
    </div>
  );
}
