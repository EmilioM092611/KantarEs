/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPromociones() {
  console.log('🎉 Seeding promociones...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando promociones existentes...');
  await prisma.producto_promocion.deleteMany({});
  await prisma.promociones.deleteMany({});

  const promociones = await prisma.promociones.createMany({
    data: [
      {
        nombre: 'Happy Hour - Bebidas 2x1',
        descripcion: 'Compra 2 bebidas alcohólicas y paga solo 1',
        tipo: 'x1', // 2x1
        valor: 50.0,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-12-31'),
        hora_inicio: new Date('2025-01-01T17:00:00'),
        hora_fin: new Date('2025-01-01T19:00:00'),
        dias_semana: '1,2,3,4,5', // Lunes a Viernes
        aplicacion: 'categoria',
        condicion_monto_minimo: 0,
        condicion_cantidad_minima: 2,
        maximo_usos_cliente: 1,
        requiere_codigo: false,
        combinable: false,
        activa: true,
      },
      {
        nombre: 'Descuento 15% Comida Completa',
        descripcion: '15% de descuento en consumo total mayor a $500',
        tipo: 'descuento_porcentaje',
        valor: 15.0,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-12-31'),
        aplicacion: 'total_cuenta',
        condicion_monto_minimo: 500.0,
        condicion_cantidad_minima: 1,
        requiere_codigo: false,
        combinable: true,
        activa: true,
      },
      {
        nombre: 'Combo Familiar',
        descripcion: 'Combo especial para 4 personas',
        tipo: 'precio_fijo',
        valor: 799.0,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-12-31'),
        aplicacion: 'producto',
        condicion_cantidad_minima: 1,
        requiere_codigo: false,
        combinable: false,
        activa: true,
      },
      {
        nombre: 'Cumpleañero Gratis',
        descripcion: 'Postre gratis para cumpleañeros',
        tipo: 'descuento_monto',
        valor: 100.0,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-12-31'),
        aplicacion: 'producto',
        condicion_cantidad_minima: 1,
        requiere_codigo: true,
        codigo_promocion: 'CUMPLE2025',
        maximo_usos_cliente: 1,
        combinable: true,
        activa: true,
      },
      {
        nombre: '3x2 en Postres',
        descripcion: 'Lleva 3 postres y paga solo 2',
        tipo: 'x2', // 3x2
        valor: 33.33,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-12-31'),
        aplicacion: 'categoria',
        condicion_cantidad_minima: 3,
        requiere_codigo: false,
        combinable: false,
        activa: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ ${promociones.count} promociones creadas`);
}

// Para ejecutar directamente
if (require.main === module) {
  seedPromociones()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
