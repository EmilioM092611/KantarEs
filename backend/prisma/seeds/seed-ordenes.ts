/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedOrdenes() {
  console.log('📋 Seeding ordenes y orden_detalle...');

  // 🗑️ Limpiar datos existentes en orden correcto
  console.log('   Limpiando órdenes existentes...');
  await prisma.orden_detalle.deleteMany({});
  await prisma.ordenes.deleteMany({});

  // Obtener datos necesarios
  const sesiones = await prisma.sesiones_mesa.findMany({
    where: { estado: 'abierta' },
  });

  const usuarios = await prisma.usuarios.findMany({
    where: { activo: true },
  });

  const productos = await prisma.productos.findMany({
    where: {
      disponible: true,
      es_vendible: true,
    },
    include: {
      inventario: true,
    },
  });

  // Filtrar solo productos con stock suficiente
  const productosConStock = productos.filter((p) => {
    if (!p.es_inventariable) return true; // No inventariables siempre disponibles
    return p.inventario && Number(p.inventario.stock_actual) > 0;
  });

  const estadosPendiente = await prisma.estados_orden.findFirst({
    where: { nombre: 'Pendiente' },
  });

  const estadosServida = await prisma.estados_orden.findFirst({
    where: { nombre: 'Servida' },
  });

  if (!sesiones.length || !usuarios.length || !productosConStock.length) {
    console.log('⚠️  No hay datos suficientes para crear órdenes');
    console.log(`   - Sesiones activas: ${sesiones.length}`);
    console.log(`   - Usuarios activos: ${usuarios.length}`);
    console.log(`   - Productos con stock: ${productosConStock.length}`);
    return;
  }

  const mesero = usuarios.find((u) => u.id_rol === 4); // Rol Mesero

  // Crear órdenes para cada sesión
  for (const sesion of sesiones.slice(0, 5)) {
    const fechaOrden = new Date();

    // Generar folio único CORTO (máximo 20 caracteres)
    const año = String(fechaOrden.getFullYear()).slice(-2); // Últimos 2 dígitos
    const mes = String(fechaOrden.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaOrden.getDate()).padStart(2, '0');
    const segundos = String(fechaOrden.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const folio = `ORD${año}${mes}${dia}${segundos}${random}`; // Formato: ORD251016XX123 (13 caracteres)

    // Crear orden
    const orden = await prisma.ordenes.create({
      data: {
        folio: folio,
        id_sesion_mesa: sesion.id_sesion,
        id_usuario_mesero: mesero?.id_usuario || usuarios[0].id_usuario,
        id_estado_orden: estadosPendiente?.id_estado_orden || 1,
        fecha_hora_orden: fechaOrden,
        para_llevar: Math.random() > 0.7,
        subtotal: 0,
        iva_monto: 0,
        total: 0,
      },
    });

    // Crear detalles de la orden (2-5 productos aleatorios)
    const numProductos = Math.floor(Math.random() * 4) + 2;
    const productosOrden = productosConStock
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numProductos, productosConStock.length));

    for (const producto of productosOrden) {
      // Determinar cantidad máxima disponible
      let cantidadMaxima = 5; // Default para no inventariables

      if (producto.es_inventariable && producto.inventario) {
        const stockDisponible = Number(producto.inventario.stock_actual);
        cantidadMaxima = Math.min(Math.floor(stockDisponible), 3); // Máximo 3 o el stock disponible
      }

      if (cantidadMaxima <= 0) continue; // Saltar si no hay stock

      const cantidad = Math.floor(Math.random() * cantidadMaxima) + 1;
      const precioUnitario = Number(producto.precio_venta);
      const subtotal = precioUnitario * cantidad;
      const ivaTasa = Number(producto.iva_tasa) / 100;
      const ivaMonto = subtotal * ivaTasa;
      const total = subtotal + ivaMonto;

      await prisma.orden_detalle.create({
        data: {
          id_orden: orden.id_orden,
          id_producto: producto.id_producto,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
          iva_monto: ivaMonto,
          total: total,
          estado: 'pendiente',
        },
      });
    }

    // Actualizar totales de la orden
    const detalles = await prisma.orden_detalle.findMany({
      where: { id_orden: orden.id_orden },
    });

    const ordenSubtotal = detalles.reduce(
      (sum, d) => sum + Number(d.subtotal),
      0,
    );
    const ordenIva = detalles.reduce((sum, d) => sum + Number(d.iva_monto), 0);
    const ordenTotal = detalles.reduce((sum, d) => sum + Number(d.total), 0);

    await prisma.ordenes.update({
      where: { id_orden: orden.id_orden },
      data: {
        subtotal: ordenSubtotal,
        iva_monto: ordenIva,
        total: ordenTotal,
      },
    });

    console.log(`✅ Orden ${folio} creada con ${detalles.length} productos`);
  }
}

if (require.main === module) {
  seedOrdenes()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
