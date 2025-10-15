-- CreateEnum
CREATE TYPE "afecta_inventario" AS ENUM ('suma', 'resta', 'ajuste');

-- CreateEnum
CREATE TYPE "aplicacion_promocion" AS ENUM ('producto', 'categoria', 'total_cuenta');

-- CreateEnum
CREATE TYPE "estado_cc" AS ENUM ('abierta', 'parcial', 'liquidada');

-- CreateEnum
CREATE TYPE "estado_compra" AS ENUM ('pendiente', 'autorizada', 'recibida', 'cancelada');

-- CreateEnum
CREATE TYPE "estado_corte" AS ENUM ('abierto', 'cerrado', 'cancelado');

-- CreateEnum
CREATE TYPE "estado_orden_detalle" AS ENUM ('pendiente', 'preparando', 'listo', 'servido', 'cancelado');

-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('pendiente', 'completado', 'cancelado', 'reembolsado');

-- CreateEnum
CREATE TYPE "estado_reservacion" AS ENUM ('pendiente', 'confirmada', 'cancelada', 'no_show', 'cumplida');

-- CreateEnum
CREATE TYPE "estado_sesion" AS ENUM ('abierta', 'cerrada', 'cancelada', 'pausada');

-- CreateEnum
CREATE TYPE "tipo_area_preparacion" AS ENUM ('cocina', 'barra', 'ninguna');

-- CreateEnum
CREATE TYPE "tipo_promocion" AS ENUM ('descuento_porcentaje', 'descuento_monto', '2x1', '3x2', 'precio_fijo', 'combo');

-- CreateEnum
CREATE TYPE "tipo_tarjeta" AS ENUM ('debito', 'credito');

-- CreateEnum
CREATE TYPE "tipo_unidad" AS ENUM ('peso', 'volumen', 'unidad');

-- CreateTable
CREATE TABLE "auditoria_sistema" (
    "id_auditoria" BIGSERIAL NOT NULL,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "id_registro" INTEGER NOT NULL,
    "accion" VARCHAR(10) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "valores_anteriores" JSONB,
    "valores_nuevos" JSONB,
    "ip_address" INET,
    "user_agent" VARCHAR(255),
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_sistema_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "descripcion" VARCHAR(200),
    "id_categoria_padre" INTEGER,
    "id_tipo_producto" INTEGER,
    "imagen_url" VARCHAR(500),
    "orden_visualizacion" INTEGER,
    "visible_menu" BOOLEAN DEFAULT true,
    "activa" BOOLEAN DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "cc_movimientos" (
    "id_mov" SERIAL NOT NULL,
    "id_cc" INTEGER NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" VARCHAR(120),
    "id_orden" INTEGER,
    "id_pago" INTEGER,

    CONSTRAINT "cc_movimientos_pkey" PRIMARY KEY ("id_mov")
);

-- CreateTable
CREATE TABLE "cfdi_comprobantes" (
    "id_cfdi" SERIAL NOT NULL,
    "id_orden" INTEGER,
    "id_receptor" INTEGER NOT NULL,
    "tipo" CHAR(1) NOT NULL DEFAULT 'I',
    "serie" VARCHAR(10),
    "folio" VARCHAR(20),
    "uuid" VARCHAR(50),
    "estatus" VARCHAR(12) NOT NULL DEFAULT 'pendiente',
    "subtotal" DECIMAL(14,2),
    "impuestos" JSONB,
    "total" DECIMAL(14,2),
    "fecha_emision" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xml" TEXT,
    "pdf_url" TEXT,
    "error_msg" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_cancelacion" TIMESTAMPTZ(6),
    "acuse_cancelacion" TEXT,
    "motivo_cancelacion" VARCHAR(2),
    "uuid_relacionado" VARCHAR(50),

    CONSTRAINT "cfdi_comprobantes_pkey" PRIMARY KEY ("id_cfdi")
);

-- CreateTable
CREATE TABLE "cfdi_receptores" (
    "id_receptor" SERIAL NOT NULL,
    "rfc" VARCHAR(13) NOT NULL,
    "razon_social" VARCHAR(160) NOT NULL,
    "regimen_fiscal" VARCHAR(3) NOT NULL,
    "uso_cfdi" VARCHAR(3) NOT NULL,
    "email" VARCHAR(120),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cfdi_receptores_pkey" PRIMARY KEY ("id_receptor")
);

-- CreateTable
CREATE TABLE "compra_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_compra" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad_pedida" DECIMAL(12,4) NOT NULL,
    "cantidad_recibida" DECIMAL(12,4) DEFAULT 0.0000,
    "id_unidad_medida" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,4) NOT NULL,
    "descuento_porcentaje" DECIMAL(5,2) DEFAULT 0.00,
    "descuento_monto" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva_monto" DECIMAL(10,2) DEFAULT 0.00,
    "ieps_monto" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL,
    "lote" VARCHAR(50),
    "fecha_caducidad" DATE,
    "observaciones" TEXT,

    CONSTRAINT "compra_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "compras" (
    "id_compra" SERIAL NOT NULL,
    "folio_compra" VARCHAR(30) NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario_solicita" INTEGER NOT NULL,
    "id_usuario_autoriza" INTEGER,
    "fecha_pedido" DATE NOT NULL,
    "fecha_recepcion" DATE,
    "numero_factura" VARCHAR(50),
    "subtotal" DECIMAL(12,2) DEFAULT 0.00,
    "iva_monto" DECIMAL(10,2) DEFAULT 0.00,
    "ieps_monto" DECIMAL(10,2) DEFAULT 0.00,
    "otros_impuestos" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(12,2) DEFAULT 0.00,
    "estado" "estado_compra" DEFAULT 'pendiente',
    "observaciones" TEXT,
    "documento_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "cortes_caja" (
    "id_corte" SERIAL NOT NULL,
    "folio_corte" VARCHAR(30) NOT NULL,
    "id_tipo_corte" INTEGER NOT NULL,
    "id_usuario_realiza" INTEGER NOT NULL,
    "id_usuario_autoriza" INTEGER,
    "fecha_hora_inicio" TIMESTAMPTZ(6) NOT NULL,
    "fecha_hora_fin" TIMESTAMPTZ(6) NOT NULL,
    "total_ventas_sistema" DECIMAL(12,2) DEFAULT 0.00,
    "total_efectivo_sistema" DECIMAL(12,2) DEFAULT 0.00,
    "total_tarjeta_sistema" DECIMAL(12,2) DEFAULT 0.00,
    "total_otros_sistema" DECIMAL(12,2) DEFAULT 0.00,
    "efectivo_contado" DECIMAL(12,2) DEFAULT 0.00,
    "efectivo_diferencia" DECIMAL(12,2) DEFAULT 0.00,
    "fondo_caja_inicial" DECIMAL(10,2) DEFAULT 0.00,
    "fondo_caja_final" DECIMAL(10,2) DEFAULT 0.00,
    "retiros_efectivo" DECIMAL(10,2) DEFAULT 0.00,
    "gastos_caja" DECIMAL(10,2) DEFAULT 0.00,
    "numero_transacciones" INTEGER DEFAULT 0,
    "observaciones" TEXT,
    "estado" "estado_corte" DEFAULT 'abierto',
    "id_corte_anterior" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cortes_caja_pkey" PRIMARY KEY ("id_corte")
);

-- CreateTable
CREATE TABLE "cuentas_cobrar" (
    "id_cc" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "referencia" VARCHAR(80) NOT NULL,
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vencimiento" DATE,
    "estado" "estado_cc" NOT NULL DEFAULT 'abierta',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_cobrar_pkey" PRIMARY KEY ("id_cc")
);

-- CreateTable
CREATE TABLE "estados_mesa" (
    "id_estado_mesa" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "color_hex" VARCHAR(7),
    "icono" VARCHAR(50),
    "orden_visualizacion" INTEGER,

    CONSTRAINT "estados_mesa_pkey" PRIMARY KEY ("id_estado_mesa")
);

-- CreateTable
CREATE TABLE "estados_orden" (
    "id_estado_orden" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(100),
    "color_hex" VARCHAR(7),
    "siguiente_estado_permitido" VARCHAR(100),
    "notifica_cocina" BOOLEAN DEFAULT false,
    "notifica_cliente" BOOLEAN DEFAULT false,

    CONSTRAINT "estados_orden_pkey" PRIMARY KEY ("id_estado_orden")
);

-- CreateTable
CREATE TABLE "generos" (
    "id_genero" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "abreviatura" CHAR(1),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id_genero")
);

-- CreateTable
CREATE TABLE "historial_precios_producto" (
    "id_historial" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "precio_anterior" DECIMAL(10,2) NOT NULL,
    "precio_nuevo" DECIMAL(10,2) NOT NULL,
    "id_usuario_modifica" INTEGER NOT NULL,
    "motivo_cambio" VARCHAR(200),
    "fecha_cambio" TIMESTAMPTZ(6) NOT NULL,
    "fecha_vigencia_inicio" DATE NOT NULL,
    "fecha_vigencia_fin" DATE,

    CONSTRAINT "historial_precios_producto_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id_inventario" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "stock_actual" DECIMAL(12,4) DEFAULT 0.0000,
    "stock_minimo" DECIMAL(12,4) DEFAULT 0.0000,
    "stock_maximo" DECIMAL(12,4),
    "punto_reorden" DECIMAL(12,4),
    "ubicacion_almacen" VARCHAR(50),
    "lote_actual" VARCHAR(50),
    "fecha_ultima_compra" DATE,
    "fecha_ultimo_inventario" DATE,
    "requiere_refrigeracion" BOOLEAN DEFAULT false,
    "dias_caducidad" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50),
    "ip_address" INET,
    "intento_exitoso" BOOLEAN,
    "fecha_hora" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_agent" VARCHAR(255),
    "razon_fallo" VARCHAR(100),

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id_mesa" SERIAL NOT NULL,
    "numero_mesa" VARCHAR(10) NOT NULL,
    "capacidad_personas" INTEGER NOT NULL,
    "ubicacion" VARCHAR(100),
    "planta" INTEGER DEFAULT 1,
    "coordenada_x" INTEGER,
    "coordenada_y" INTEGER,
    "id_estado_mesa" INTEGER,
    "activa" BOOLEAN DEFAULT true,
    "requiere_limpieza" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id_mesa")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id_metodo_pago" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(100),
    "requiere_referencia" BOOLEAN DEFAULT false,
    "requiere_autorizacion" BOOLEAN DEFAULT false,
    "comision_porcentaje" DECIMAL(5,2) DEFAULT 0.00,
    "activo" BOOLEAN DEFAULT true,
    "icono" VARCHAR(50),

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id_metodo_pago")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "id_unidad_medida" INTEGER NOT NULL,
    "fecha_movimiento" TIMESTAMPTZ(6) NOT NULL,
    "id_compra" INTEGER,
    "id_orden" INTEGER,
    "lote" VARCHAR(50),
    "fecha_caducidad" DATE,
    "costo_unitario" DECIMAL(10,4),
    "observaciones" TEXT,
    "id_movimiento_referencia" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "orden_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,4) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "descuento_porcentaje" DECIMAL(5,2) DEFAULT 0.00,
    "descuento_monto" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "iva_monto" DECIMAL(10,2) DEFAULT 0.00,
    "ieps_monto" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "notas_especiales" TEXT,
    "tiempo_preparacion_real" INTEGER,
    "id_usuario_prepara" INTEGER,
    "estado" "estado_orden_detalle" DEFAULT 'pendiente',
    "motivo_cancelacion" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orden_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id_orden" SERIAL NOT NULL,
    "folio" VARCHAR(20) NOT NULL,
    "id_sesion_mesa" INTEGER NOT NULL,
    "id_usuario_mesero" INTEGER NOT NULL,
    "id_estado_orden" INTEGER NOT NULL,
    "fecha_hora_orden" TIMESTAMPTZ(6) NOT NULL,
    "fecha_hora_preparacion" TIMESTAMPTZ(6),
    "fecha_hora_servido" TIMESTAMPTZ(6),
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "descuento_porcentaje" DECIMAL(5,2) DEFAULT 0.00,
    "descuento_monto" DECIMAL(10,2) DEFAULT 0.00,
    "iva_monto" DECIMAL(10,2) DEFAULT 0.00,
    "ieps_monto" DECIMAL(10,2) DEFAULT 0.00,
    "propina" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) DEFAULT 0.00,
    "observaciones" TEXT,
    "para_llevar" BOOLEAN DEFAULT false,
    "id_promocion_aplicada" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id_orden")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "folio_pago" VARCHAR(30) NOT NULL,
    "id_orden" INTEGER NOT NULL,
    "id_metodo_pago" INTEGER NOT NULL,
    "id_usuario_cobra" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_hora_pago" TIMESTAMPTZ(6) NOT NULL,
    "referencia_transaccion" VARCHAR(100),
    "numero_autorizacion" VARCHAR(50),
    "ultimos_4_digitos" VARCHAR(4),
    "nombre_tarjetahabiente" VARCHAR(100),
    "tipo_tarjeta" "tipo_tarjeta",
    "banco_emisor" VARCHAR(50),
    "cambio_entregado" DECIMAL(10,2) DEFAULT 0.00,
    "estado" "estado_pago" DEFAULT 'pendiente',
    "motivo_cancelacion" VARCHAR(200),
    "id_corte_caja" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "personas" (
    "id_persona" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "apellido_paterno" VARCHAR(60) NOT NULL,
    "apellido_materno" VARCHAR(60),
    "fecha_nacimiento" DATE,
    "id_genero" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "producto_combo" (
    "id" SERIAL NOT NULL,
    "id_producto_combo" INTEGER NOT NULL,
    "id_producto_componente" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,4) NOT NULL,
    "es_opcional" BOOLEAN DEFAULT false,
    "precio_adicional" DECIMAL(10,2) DEFAULT 0.00,
    "grupo_opciones" VARCHAR(50),
    "orden_visualizacion" INTEGER,

    CONSTRAINT "producto_combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_promocion" (
    "id" SERIAL NOT NULL,
    "id_promocion" INTEGER NOT NULL,
    "id_producto" INTEGER,
    "id_categoria" INTEGER,
    "precio_especial" DECIMAL(10,2),
    "cantidad_requerida" INTEGER DEFAULT 1,
    "cantidad_bonificada" INTEGER DEFAULT 0,

    CONSTRAINT "producto_promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "id_categoria" INTEGER NOT NULL,
    "id_unidad_medida" INTEGER NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "costo_promedio" DECIMAL(10,2),
    "iva_tasa" DECIMAL(5,2) DEFAULT 16.00,
    "ieps_tasa" DECIMAL(5,2) DEFAULT 0.00,
    "tiempo_preparacion_min" INTEGER DEFAULT 10,
    "calorias" INTEGER,
    "es_inventariable" BOOLEAN DEFAULT true,
    "es_vendible" BOOLEAN DEFAULT true,
    "es_insumo" BOOLEAN DEFAULT false,
    "es_combo" BOOLEAN DEFAULT false,
    "imagen_url" VARCHAR(500),
    "codigo_barras" VARCHAR(50),
    "receta" TEXT,
    "alergenos" VARCHAR(200),
    "disponible" BOOLEAN DEFAULT true,
    "destacado" BOOLEAN DEFAULT false,
    "orden_menu" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "promociones" (
    "id_promocion" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo" "tipo_promocion" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "hora_inicio" TIME(6),
    "hora_fin" TIME(6),
    "dias_semana" VARCHAR(20),
    "aplicacion" "aplicacion_promocion" NOT NULL,
    "condicion_monto_minimo" DECIMAL(10,2) DEFAULT 0.00,
    "condicion_cantidad_minima" INTEGER DEFAULT 1,
    "maximo_usos_total" INTEGER,
    "maximo_usos_cliente" INTEGER DEFAULT 1,
    "usos_actuales" INTEGER DEFAULT 0,
    "requiere_codigo" BOOLEAN DEFAULT false,
    "codigo_promocion" VARCHAR(20),
    "combinable" BOOLEAN DEFAULT false,
    "activa" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("id_promocion")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id_proveedor" SERIAL NOT NULL,
    "razon_social" VARCHAR(150) NOT NULL,
    "nombre_comercial" VARCHAR(150),
    "rfc" VARCHAR(13) NOT NULL,
    "direccion" TEXT,
    "ciudad" VARCHAR(100),
    "estado" VARCHAR(100),
    "codigo_postal" VARCHAR(10),
    "telefono" VARCHAR(15),
    "email" VARCHAR(100),
    "contacto_nombre" VARCHAR(100),
    "contacto_telefono" VARCHAR(15),
    "dias_credito" INTEGER DEFAULT 0,
    "limite_credito" DECIMAL(12,2) DEFAULT 0.00,
    "cuenta_bancaria" VARCHAR(20),
    "banco" VARCHAR(50),
    "calificacion" INTEGER DEFAULT 5,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "receta_insumos" (
    "id" SERIAL NOT NULL,
    "id_producto_final" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "cantidad_necesaria" DECIMAL(10,4) NOT NULL,
    "id_unidad_medida" INTEGER NOT NULL,
    "merma_esperada_porcentaje" DECIMAL(5,2) DEFAULT 0.00,
    "notas_preparacion" TEXT,

    CONSTRAINT "receta_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservaciones" (
    "id_reservacion" SERIAL NOT NULL,
    "id_mesa" INTEGER,
    "nombre_cliente" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "personas" INTEGER DEFAULT 1,
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL,
    "fecha_fin" TIMESTAMPTZ(6) NOT NULL,
    "estado" "estado_reservacion" DEFAULT 'pendiente',
    "notas" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservaciones_pkey" PRIMARY KEY ("id_reservacion")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "permisos" JSONB,
    "nivel_acceso" INTEGER DEFAULT 1,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "sesiones_mesa" (
    "id_sesion" SERIAL NOT NULL,
    "id_mesa" INTEGER NOT NULL,
    "id_usuario_apertura" INTEGER NOT NULL,
    "id_usuario_cierre" INTEGER,
    "fecha_hora_apertura" TIMESTAMPTZ(6) NOT NULL,
    "fecha_hora_cierre" TIMESTAMPTZ(6),
    "numero_comensales" INTEGER DEFAULT 1,
    "nombre_cliente" VARCHAR(100),
    "observaciones" TEXT,
    "estado" "estado_sesion" DEFAULT 'abierta',
    "motivo_cancelacion" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_mesa_pkey" PRIMARY KEY ("id_sesion")
);

-- CreateTable
CREATE TABLE "tipos_corte" (
    "id_tipo_corte" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(200),
    "reinicia_consecutivos" BOOLEAN DEFAULT false,

    CONSTRAINT "tipos_corte_pkey" PRIMARY KEY ("id_tipo_corte")
);

-- CreateTable
CREATE TABLE "tipos_movimiento" (
    "id_tipo_movimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "afecta_inventario" "afecta_inventario" NOT NULL,
    "requiere_autorizacion" BOOLEAN DEFAULT false,

    CONSTRAINT "tipos_movimiento_pkey" PRIMARY KEY ("id_tipo_movimiento")
);

-- CreateTable
CREATE TABLE "tipos_producto" (
    "id_tipo_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "requiere_preparacion" BOOLEAN DEFAULT false,
    "area_preparacion" "tipo_area_preparacion" DEFAULT 'ninguna',
    "orden_menu" INTEGER,
    "icono" VARCHAR(50),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "tipos_producto_pkey" PRIMARY KEY ("id_tipo_producto")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id_unidad" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "abreviatura" VARCHAR(10) NOT NULL,
    "tipo" "tipo_unidad" NOT NULL,
    "factor_conversion" DECIMAL(10,4) DEFAULT 1.0000,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id_unidad")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100),
    "telefono" VARCHAR(15),
    "id_persona" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "pin_rapido" VARCHAR(6),
    "activo" BOOLEAN DEFAULT true,
    "ultimo_acceso" TIMESTAMPTZ(6),
    "intentos_fallidos" INTEGER DEFAULT 0,
    "bloqueado_hasta" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE INDEX "idx_auditoria_accion" ON "auditoria_sistema"("accion");

-- CreateIndex
CREATE INDEX "idx_auditoria_fecha" ON "auditoria_sistema"("fecha_hora");

-- CreateIndex
CREATE INDEX "idx_auditoria_fecha_desc" ON "auditoria_sistema"("fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla_fecha" ON "auditoria_sistema"("tabla_afectada", "fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla_registro" ON "auditoria_sistema"("tabla_afectada", "id_registro");

-- CreateIndex
CREATE INDEX "idx_auditoria_usuario_fecha" ON "auditoria_sistema"("id_usuario", "fecha_hora");

-- CreateIndex
CREATE INDEX "idx_categorias_activa" ON "categorias"("activa");

-- CreateIndex
CREATE INDEX "idx_categorias_orden" ON "categorias"("orden_visualizacion");

-- CreateIndex
CREATE INDEX "idx_categorias_padre" ON "categorias"("id_categoria_padre");

-- CreateIndex
CREATE INDEX "idx_categorias_tipo" ON "categorias"("id_tipo_producto");

-- CreateIndex
CREATE INDEX "idx_cc_mov_fecha" ON "cc_movimientos"("id_cc", "fecha");

-- CreateIndex
CREATE INDEX "idx_cfdi_orden" ON "cfdi_comprobantes"("id_orden");

-- CreateIndex
CREATE INDEX "idx_cfdi_receptor" ON "cfdi_comprobantes"("id_receptor");

-- CreateIndex
CREATE INDEX "idx_cfdi_uuid" ON "cfdi_comprobantes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cfdi_receptor" ON "cfdi_receptores"("rfc", "razon_social");

-- CreateIndex
CREATE INDEX "idx_compra_detalle_compra" ON "compra_detalle"("id_compra");

-- CreateIndex
CREATE INDEX "idx_compra_detalle_producto" ON "compra_detalle"("id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "compras_folio_compra_key" ON "compras"("folio_compra");

-- CreateIndex
CREATE INDEX "idx_compras_estado" ON "compras"("estado");

-- CreateIndex
CREATE INDEX "idx_compras_fecha" ON "compras"("fecha_pedido");

-- CreateIndex
CREATE INDEX "idx_compras_folio" ON "compras"("folio_compra");

-- CreateIndex
CREATE INDEX "idx_compras_proveedor" ON "compras"("id_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "cortes_caja_folio_corte_key" ON "cortes_caja"("folio_corte");

-- CreateIndex
CREATE INDEX "idx_cortes_estado" ON "cortes_caja"("estado");

-- CreateIndex
CREATE INDEX "idx_cortes_fecha" ON "cortes_caja"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "idx_cortes_folio" ON "cortes_caja"("folio_corte");

-- CreateIndex
CREATE INDEX "idx_cortes_tipo" ON "cortes_caja"("id_tipo_corte");

-- CreateIndex
CREATE INDEX "idx_cc_estado" ON "cuentas_cobrar"("estado");

-- CreateIndex
CREATE INDEX "idx_cc_persona" ON "cuentas_cobrar"("id_persona");

-- CreateIndex
CREATE UNIQUE INDEX "estados_mesa_nombre_key" ON "estados_mesa"("nombre");

-- CreateIndex
CREATE INDEX "idx_estados_mesa_orden" ON "estados_mesa"("orden_visualizacion");

-- CreateIndex
CREATE UNIQUE INDEX "estados_orden_nombre_key" ON "estados_orden"("nombre");

-- CreateIndex
CREATE INDEX "idx_estados_orden_nombre" ON "estados_orden"("nombre");

-- CreateIndex
CREATE INDEX "idx_generos_activo" ON "generos"("activo");

-- CreateIndex
CREATE INDEX "idx_historial_fecha" ON "historial_precios_producto"("fecha_cambio");

-- CreateIndex
CREATE INDEX "idx_historial_producto" ON "historial_precios_producto"("id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_id_producto_key" ON "inventario"("id_producto");

-- CreateIndex
CREATE INDEX "idx_inventario_producto" ON "inventario"("id_producto");

-- CreateIndex
CREATE INDEX "idx_inventario_stock" ON "inventario"("stock_actual");

-- CreateIndex
CREATE INDEX "idx_login_attempts_ip" ON "login_attempts"("ip_address", "fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "idx_login_attempts_username" ON "login_attempts"("username", "fecha_hora" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_mesa_key" ON "mesas"("numero_mesa");

-- CreateIndex
CREATE INDEX "idx_mesas_activa" ON "mesas"("activa");

-- CreateIndex
CREATE INDEX "idx_mesas_estado" ON "mesas"("id_estado_mesa");

-- CreateIndex
CREATE INDEX "idx_mesas_numero" ON "mesas"("numero_mesa");

-- CreateIndex
CREATE INDEX "idx_metodos_pago_activo" ON "metodos_pago"("activo");

-- CreateIndex
CREATE INDEX "idx_movimientos_compra" ON "movimientos_inventario"("id_compra");

-- CreateIndex
CREATE INDEX "idx_movimientos_fecha" ON "movimientos_inventario"("fecha_movimiento");

-- CreateIndex
CREATE INDEX "idx_movimientos_fecha_tipo_producto" ON "movimientos_inventario"("fecha_movimiento", "id_tipo_movimiento", "id_producto");

-- CreateIndex
CREATE INDEX "idx_movimientos_orden" ON "movimientos_inventario"("id_orden");

-- CreateIndex
CREATE INDEX "idx_movimientos_producto" ON "movimientos_inventario"("id_producto");

-- CreateIndex
CREATE INDEX "idx_movimientos_tipo" ON "movimientos_inventario"("id_tipo_movimiento");

-- CreateIndex
CREATE INDEX "idx_orden_detalle_estado" ON "orden_detalle"("estado");

-- CreateIndex
CREATE INDEX "idx_orden_detalle_orden" ON "orden_detalle"("id_orden");

-- CreateIndex
CREATE INDEX "idx_orden_detalle_orden_producto" ON "orden_detalle"("id_orden", "id_producto");

-- CreateIndex
CREATE INDEX "idx_orden_detalle_producto" ON "orden_detalle"("id_producto");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_folio_key" ON "ordenes"("folio");

-- CreateIndex
CREATE INDEX "idx_ordenes_estado" ON "ordenes"("id_estado_orden");

-- CreateIndex
CREATE INDEX "idx_ordenes_fecha" ON "ordenes"("fecha_hora_orden");

-- CreateIndex
CREATE INDEX "idx_ordenes_fecha_estado" ON "ordenes"("fecha_hora_orden", "id_estado_orden");

-- CreateIndex
CREATE INDEX "idx_ordenes_folio" ON "ordenes"("folio");

-- CreateIndex
CREATE INDEX "idx_ordenes_mesero" ON "ordenes"("id_usuario_mesero");

-- CreateIndex
CREATE INDEX "idx_ordenes_sesion" ON "ordenes"("id_sesion_mesa");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_folio_pago_key" ON "pagos"("folio_pago");

-- CreateIndex
CREATE INDEX "idx_pagos_corte" ON "pagos"("id_corte_caja");

-- CreateIndex
CREATE INDEX "idx_pagos_estado" ON "pagos"("estado");

-- CreateIndex
CREATE INDEX "idx_pagos_fecha" ON "pagos"("fecha_hora_pago");

-- CreateIndex
CREATE INDEX "idx_pagos_folio" ON "pagos"("folio_pago");

-- CreateIndex
CREATE INDEX "idx_pagos_orden" ON "pagos"("id_orden");

-- CreateIndex
CREATE INDEX "idx_personas_nombre" ON "personas"("nombre", "apellido_paterno");

-- CreateIndex
CREATE INDEX "idx_producto_combo_combo" ON "producto_combo"("id_producto_combo");

-- CreateIndex
CREATE INDEX "idx_producto_combo_componente" ON "producto_combo"("id_producto_componente");

-- CreateIndex
CREATE INDEX "idx_producto_promocion_cat" ON "producto_promocion"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_producto_promocion_prod" ON "producto_promocion"("id_producto");

-- CreateIndex
CREATE INDEX "idx_producto_promocion_promo" ON "producto_promocion"("id_promocion");

-- CreateIndex
CREATE UNIQUE INDEX "producto_promocion_id_promocion_id_producto_id_categoria_key" ON "producto_promocion"("id_promocion", "id_producto", "id_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "idx_productos_categoria" ON "productos"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_productos_disponible" ON "productos"("disponible");

-- CreateIndex
CREATE INDEX "idx_productos_nombre" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "idx_productos_sku" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "idx_productos_vendible" ON "productos"("es_vendible");

-- CreateIndex
CREATE UNIQUE INDEX "promociones_codigo_promocion_key" ON "promociones"("codigo_promocion");

-- CreateIndex
CREATE INDEX "idx_promociones_activa" ON "promociones"("activa");

-- CreateIndex
CREATE INDEX "idx_promociones_codigo" ON "promociones"("codigo_promocion");

-- CreateIndex
CREATE INDEX "idx_promociones_fechas" ON "promociones"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_rfc_key" ON "proveedores"("rfc");

-- CreateIndex
CREATE INDEX "idx_proveedores_activo" ON "proveedores"("activo");

-- CreateIndex
CREATE INDEX "idx_proveedores_nombre" ON "proveedores"("razon_social");

-- CreateIndex
CREATE INDEX "idx_proveedores_rfc" ON "proveedores"("rfc");

-- CreateIndex
CREATE INDEX "idx_receta_insumo" ON "receta_insumos"("id_insumo");

-- CreateIndex
CREATE INDEX "idx_receta_producto_final" ON "receta_insumos"("id_producto_final");

-- CreateIndex
CREATE INDEX "idx_reservas_estado" ON "reservaciones"("estado");

-- CreateIndex
CREATE INDEX "idx_reservas_fecha" ON "reservaciones"("fecha_inicio");

-- CreateIndex
CREATE INDEX "idx_reservas_mesa_rango" ON "reservaciones"("id_mesa", "fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE INDEX "idx_roles_activo" ON "roles"("activo");

-- CreateIndex
CREATE INDEX "idx_roles_nivel" ON "roles"("nivel_acceso");

-- CreateIndex
CREATE INDEX "idx_sesiones_estado" ON "sesiones_mesa"("estado");

-- CreateIndex
CREATE INDEX "idx_sesiones_fecha" ON "sesiones_mesa"("fecha_hora_apertura");

-- CreateIndex
CREATE INDEX "idx_sesiones_mesa" ON "sesiones_mesa"("id_mesa");

-- CreateIndex
CREATE INDEX "idx_sesiones_mesa_fecha_estado" ON "sesiones_mesa"("fecha_hora_apertura", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_corte_nombre_key" ON "tipos_corte"("nombre");

-- CreateIndex
CREATE INDEX "idx_tipos_mov_afecta" ON "tipos_movimiento"("afecta_inventario");

-- CreateIndex
CREATE INDEX "idx_tipos_activo" ON "tipos_producto"("activo");

-- CreateIndex
CREATE INDEX "idx_tipos_orden" ON "tipos_producto"("orden_menu");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_medida_abreviatura_key" ON "unidades_medida"("abreviatura");

-- CreateIndex
CREATE INDEX "idx_unidades_tipo" ON "unidades_medida"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_activo" ON "usuarios"("activo");

-- CreateIndex
CREATE INDEX "idx_usuarios_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_rol" ON "usuarios"("id_rol");

-- CreateIndex
CREATE INDEX "idx_usuarios_username" ON "usuarios"("username");

-- AddForeignKey
ALTER TABLE "auditoria_sistema" ADD CONSTRAINT "auditoria_sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_id_categoria_padre_fkey" FOREIGN KEY ("id_categoria_padre") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_id_tipo_producto_fkey" FOREIGN KEY ("id_tipo_producto") REFERENCES "tipos_producto"("id_tipo_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cc_movimientos" ADD CONSTRAINT "cc_movimientos_id_cc_fkey" FOREIGN KEY ("id_cc") REFERENCES "cuentas_cobrar"("id_cc") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cc_movimientos" ADD CONSTRAINT "cc_movimientos_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cc_movimientos" ADD CONSTRAINT "cc_movimientos_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id_pago") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cfdi_comprobantes" ADD CONSTRAINT "cfdi_comprobantes_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cfdi_comprobantes" ADD CONSTRAINT "cfdi_comprobantes_id_receptor_fkey" FOREIGN KEY ("id_receptor") REFERENCES "cfdi_receptores"("id_receptor") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "compras"("id_compra") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_detalle" ADD CONSTRAINT "compra_detalle_id_unidad_medida_fkey" FOREIGN KEY ("id_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedores"("id_proveedor") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_usuario_autoriza_fkey" FOREIGN KEY ("id_usuario_autoriza") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_usuario_solicita_fkey" FOREIGN KEY ("id_usuario_solicita") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_id_corte_anterior_fkey" FOREIGN KEY ("id_corte_anterior") REFERENCES "cortes_caja"("id_corte") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_id_tipo_corte_fkey" FOREIGN KEY ("id_tipo_corte") REFERENCES "tipos_corte"("id_tipo_corte") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_id_usuario_autoriza_fkey" FOREIGN KEY ("id_usuario_autoriza") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes_caja" ADD CONSTRAINT "cortes_caja_id_usuario_realiza_fkey" FOREIGN KEY ("id_usuario_realiza") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobrar" ADD CONSTRAINT "cuentas_cobrar_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id_persona") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios_producto" ADD CONSTRAINT "historial_precios_producto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios_producto" ADD CONSTRAINT "historial_precios_producto_id_usuario_modifica_fkey" FOREIGN KEY ("id_usuario_modifica") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_id_estado_mesa_fkey" FOREIGN KEY ("id_estado_mesa") REFERENCES "estados_mesa"("id_estado_mesa") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "compras"("id_compra") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_movimiento_referencia_fkey" FOREIGN KEY ("id_movimiento_referencia") REFERENCES "movimientos_inventario"("id_movimiento") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "tipos_movimiento"("id_tipo_movimiento") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_unidad_medida_fkey" FOREIGN KEY ("id_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalle" ADD CONSTRAINT "orden_detalle_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalle" ADD CONSTRAINT "orden_detalle_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalle" ADD CONSTRAINT "orden_detalle_id_usuario_prepara_fkey" FOREIGN KEY ("id_usuario_prepara") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_id_estado_orden_fkey" FOREIGN KEY ("id_estado_orden") REFERENCES "estados_orden"("id_estado_orden") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_id_promocion_aplicada_fkey" FOREIGN KEY ("id_promocion_aplicada") REFERENCES "promociones"("id_promocion") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_id_sesion_mesa_fkey" FOREIGN KEY ("id_sesion_mesa") REFERENCES "sesiones_mesa"("id_sesion") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_id_usuario_mesero_fkey" FOREIGN KEY ("id_usuario_mesero") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_corte_caja_fkey" FOREIGN KEY ("id_corte_caja") REFERENCES "cortes_caja"("id_corte") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "metodos_pago"("id_metodo_pago") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_orden_fkey" FOREIGN KEY ("id_orden") REFERENCES "ordenes"("id_orden") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_usuario_cobra_fkey" FOREIGN KEY ("id_usuario_cobra") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "generos"("id_genero") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_combo" ADD CONSTRAINT "producto_combo_id_producto_combo_fkey" FOREIGN KEY ("id_producto_combo") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_combo" ADD CONSTRAINT "producto_combo_id_producto_componente_fkey" FOREIGN KEY ("id_producto_componente") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_promocion" ADD CONSTRAINT "producto_promocion_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_promocion" ADD CONSTRAINT "producto_promocion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_promocion" ADD CONSTRAINT "producto_promocion_id_promocion_fkey" FOREIGN KEY ("id_promocion") REFERENCES "promociones"("id_promocion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_unidad_medida_fkey" FOREIGN KEY ("id_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_insumos" ADD CONSTRAINT "receta_insumos_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "productos"("id_producto") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_insumos" ADD CONSTRAINT "receta_insumos_id_producto_final_fkey" FOREIGN KEY ("id_producto_final") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_insumos" ADD CONSTRAINT "receta_insumos_id_unidad_medida_fkey" FOREIGN KEY ("id_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservaciones" ADD CONSTRAINT "reservaciones_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("id_mesa") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("id_mesa") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_id_usuario_apertura_fkey" FOREIGN KEY ("id_usuario_apertura") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_id_usuario_cierre_fkey" FOREIGN KEY ("id_usuario_cierre") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "personas"("id_persona") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE CASCADE;

