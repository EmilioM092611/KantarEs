/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

// Importar todos los seeders
import { seedPromociones } from './seed-promociones';
import { seedProductoPromocion } from './seed-producto-promocion';
import { seedOrdenes } from './seed-ordenes';
import { seedPagos } from './seed-pagos';
import { seedCompras } from './seed-compras';
import { seedReservaciones } from './seed-reservaciones';
import { seedCortesCaja } from './seed-cortes-caja';
import { seedCuentasCobrar } from './seed-cuentas-cobrar';
import { seedCFDI } from './seed-cfdi';
import { seedRecetaInsumos } from './seed-receta-insumos';
import { seedProductoCombo } from './seed-producto-combo';
import { seedAuditoria } from './seed-auditoria';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando proceso de seeding...\n');

  try {
    // ORDEN IMPORTANTE: Respetar las dependencias entre tablas

    // 1. Promociones (independiente)
    console.log('\n📍 Paso 1: Promociones');
    await seedPromociones();

    // 2. Relaciones de promociones con productos/categorías
    console.log('\n📍 Paso 2: Producto-Promoción');
    await seedProductoPromocion();

    // 3. Combos de productos
    console.log('\n📍 Paso 3: Producto Combo');
    await seedProductoCombo();

    // 4. Recetas (relación entre productos)
    console.log('\n📍 Paso 4: Receta de Insumos');
    await seedRecetaInsumos();

    // 5. Reservaciones (independiente de órdenes)
    console.log('\n📍 Paso 5: Reservaciones');
    await seedReservaciones();

    // 6. Órdenes y sus detalles
    console.log('\n📍 Paso 6: Órdenes y Detalles');
    await seedOrdenes();

    // 7. Pagos (depende de órdenes)
    console.log('\n📍 Paso 7: Pagos');
    await seedPagos();

    // 8. Cortes de caja (depende de pagos)
    console.log('\n📍 Paso 8: Cortes de Caja');
    await seedCortesCaja();

    // 9. Compras y su detalle
    console.log('\n📍 Paso 9: Compras');
    await seedCompras();

    // 10. Cuentas por cobrar
    console.log('\n📍 Paso 10: Cuentas por Cobrar');
    await seedCuentasCobrar();

    // 11. CFDI (depende de órdenes pagadas)
    console.log('\n📍 Paso 11: CFDI');
    await seedCFDI();

    // 12. Auditoría (último paso)
    console.log('\n📍 Paso 12: Auditoría del Sistema');
    await seedAuditoria();

    console.log('\n\n✅ ¡Seeding completado exitosamente! 🎉\n');

    // Mostrar resumen
    const resumen = await obtenerResumen();
    console.log('📊 RESUMEN DE DATOS:\n');
    console.log(resumen);
  } catch (error) {
    console.error('\n❌ Error durante el seeding:', error);
    throw error;
  }
}

async function obtenerResumen() {
  const counts = await Promise.all([
    prisma.promociones.count(),
    prisma.producto_promocion.count(),
    prisma.producto_combo.count(),
    prisma.receta_insumos.count(),
    prisma.reservaciones.count(),
    prisma.ordenes.count(),
    prisma.orden_detalle.count(),
    prisma.pagos.count(),
    prisma.cortes_caja.count(),
    prisma.compras.count(),
    prisma.compra_detalle.count(),
    prisma.cuentas_cobrar.count(),
    prisma.cc_movimientos.count(),
    prisma.cfdi_receptores.count(),
    prisma.cfdi_comprobantes.count(),
  ]);

  return `
  ┌─────────────────────────────────────┬────────┐
  │ Tabla                               │ Count  │
  ├─────────────────────────────────────┼────────┤
  │ Promociones                         │ ${String(counts[0]).padStart(6)} │
  │ Producto-Promoción                  │ ${String(counts[1]).padStart(6)} │
  │ Producto Combo                      │ ${String(counts[2]).padStart(6)} │
  │ Receta Insumos                      │ ${String(counts[3]).padStart(6)} │
  │ Reservaciones                       │ ${String(counts[4]).padStart(6)} │
  │ Órdenes                             │ ${String(counts[5]).padStart(6)} │
  │ Orden Detalle                       │ ${String(counts[6]).padStart(6)} │
  │ Pagos                               │ ${String(counts[7]).padStart(6)} │
  │ Cortes de Caja                      │ ${String(counts[8]).padStart(6)} │
  │ Compras                             │ ${String(counts[9]).padStart(6)} │
  │ Compra Detalle                      │ ${String(counts[10]).padStart(6)} │
  │ Cuentas por Cobrar                  │ ${String(counts[11]).padStart(6)} │
  │ CC Movimientos                      │ ${String(counts[12]).padStart(6)} │
  │ CFDI Receptores                     │ ${String(counts[13]).padStart(6)} │
  │ CFDI Comprobantes                   │ ${String(counts[14]).padStart(6)} │
  └─────────────────────────────────────┴────────┘
  `;
}

// Ejecutar el seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;
