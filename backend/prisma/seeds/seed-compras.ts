/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCompras() {
  console.log('🛒 Seeding compras y compra_detalle...');

  // 🗑️ Limpiar datos existentes en orden correcto
  console.log('   Limpiando compras existentes...');
  await prisma.compra_detalle.deleteMany({});
  await prisma.compras.deleteMany({});

  const proveedores = await prisma.proveedores.findMany({
    where: { activo: true },
  });

  const productos = await prisma.productos.findMany({
    where: { es_inventariable: true },
    include: { unidades_medida: true },
  });

  const usuarios = await prisma.usuarios.findMany({
    where: { activo: true },
  });

  if (!proveedores.length || !productos.length) {
    console.log('⚠️  No hay proveedores o productos disponibles');
    return;
  }

  const gerente = usuarios.find((u) => u.id_rol === 2); // Gerente
  const solicitante = usuarios[0];

  // Crear 5 compras
  for (let i = 0; i < 5; i++) {
    const fechaPedido = new Date();
    fechaPedido.setDate(fechaPedido.getDate() - (30 - i * 5)); // Últimos 30 días

    const proveedor =
      proveedores[Math.floor(Math.random() * proveedores.length)];

    // Generar folio único CORTO (máximo 30 caracteres)
    const año = String(fechaPedido.getFullYear()).slice(-2);
    const mes = String(fechaPedido.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaPedido.getDate()).padStart(2, '0');
    const hora = String(fechaPedido.getHours()).padStart(2, '0');
    const min = String(fechaPedido.getMinutes()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const folio = `CMP${año}${mes}${dia}${hora}${min}${random}`; // Formato: CMP2510161830XX (14 caracteres)

    // Determinar estado (80% recibidas, 20% pendientes)
    const estado = Math.random() > 0.2 ? 'recibida' : 'pendiente';
    const fechaRecepcion =
      estado === 'recibida'
        ? new Date(fechaPedido.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 días después
        : null;

    const compra = await prisma.compras.create({
      data: {
        folio_compra: folio,
        id_proveedor: proveedor.id_proveedor,
        id_usuario_solicita: solicitante.id_usuario,
        id_usuario_autoriza: gerente?.id_usuario,
        fecha_pedido: fechaPedido,
        fecha_recepcion: fechaRecepcion,
        numero_factura:
          estado === 'recibida'
            ? `FAC-${Math.floor(Math.random() * 100000)}`
            : null,
        estado: estado as any,
        subtotal: 0,
        iva_monto: 0,
        total: 0,
      },
    });

    // Agregar 3-7 productos a la compra
    const numProductos = Math.floor(Math.random() * 5) + 3;
    const productosCompra = productos
      .sort(() => 0.5 - Math.random())
      .slice(0, numProductos);

    for (const producto of productosCompra) {
      const cantidadPedida = Math.floor(Math.random() * 50) + 10;
      const cantidadRecibida =
        estado === 'recibida'
          ? cantidadPedida - Math.floor(Math.random() * 3) // Puede haber pequeñas diferencias
          : 0;

      const precioUnitario =
        Number(producto.costo_promedio) || Number(producto.precio_venta) * 0.6;
      const subtotal = precioUnitario * cantidadPedida;
      const ivaMonto = subtotal * 0.16;
      const total = subtotal + ivaMonto;

      await prisma.compra_detalle.create({
        data: {
          id_compra: compra.id_compra,
          id_producto: producto.id_producto,
          cantidad_pedida: cantidadPedida,
          cantidad_recibida: cantidadRecibida,
          id_unidad_medida: producto.id_unidad_medida,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
          iva_monto: ivaMonto,
          total: total,
          lote:
            estado === 'recibida'
              ? `LOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
              : null,
          fecha_caducidad:
            estado === 'recibida'
              ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 meses
              : null,
        },
      });
    }

    // Actualizar totales de la compra
    const detalles = await prisma.compra_detalle.findMany({
      where: { id_compra: compra.id_compra },
    });

    const compraSubtotal = detalles.reduce(
      (sum, d) => sum + Number(d.subtotal),
      0,
    );
    const compraIva = detalles.reduce((sum, d) => sum + Number(d.iva_monto), 0);
    const compraTotal = detalles.reduce((sum, d) => sum + Number(d.total), 0);

    await prisma.compras.update({
      where: { id_compra: compra.id_compra },
      data: {
        subtotal: compraSubtotal,
        iva_monto: compraIva,
        total: compraTotal,
      },
    });

    console.log(
      `✅ Compra ${folio} creada: $${compraTotal.toFixed(2)} (${estado})`,
    );
  }
}

if (require.main === module) {
  seedCompras()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
