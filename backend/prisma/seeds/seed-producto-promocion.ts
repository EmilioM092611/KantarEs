/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedProductoPromocion() {
  console.log('🔗 Seeding producto_promocion...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando relaciones producto-promoción existentes...');
  await prisma.producto_promocion.deleteMany({});

  // Primero obtenemos los IDs necesarios
  const promociones = await prisma.promociones.findMany();
  const categorias = await prisma.categorias.findMany();
  const productos = await prisma.productos.findMany();

  // Happy Hour - Bebidas (asumiendo que hay una categoría de bebidas)
  const categoriaBebidas = categorias.find((c) =>
    c.nombre.toLowerCase().includes('bebida'),
  );
  const promocionHappyHour = promociones.find((p) =>
    p.nombre.includes('Happy Hour'),
  );

  // Postres 3x2
  const categoriaPostres = categorias.find((c) =>
    c.nombre.toLowerCase().includes('postre'),
  );
  const promocion3x2 = promociones.find((p) => p.nombre.includes('3x2'));

  // Combo Familiar - productos específicos
  const promocionCombo = promociones.find((p) =>
    p.nombre.includes('Combo Familiar'),
  );

  const data: Array<{
    id_promocion: number;
    id_categoria?: number;
    id_producto?: number;
    precio_especial?: number;
    cantidad_requerida?: number;
    cantidad_bonificada?: number;
  }> = [];

  // Happy Hour aplicado a categoría de bebidas
  if (promocionHappyHour && categoriaBebidas) {
    data.push({
      id_promocion: promocionHappyHour.id_promocion,
      id_categoria: categoriaBebidas.id_categoria,
      cantidad_requerida: 2,
      cantidad_bonificada: 1,
    });
  }

  // 3x2 en postres
  if (promocion3x2 && categoriaPostres) {
    data.push({
      id_promocion: promocion3x2.id_promocion,
      id_categoria: categoriaPostres.id_categoria,
      cantidad_requerida: 3,
      cantidad_bonificada: 1,
    });
  }

  // Combo Familiar con productos específicos
  if (promocionCombo && productos.length >= 4) {
    const productosCombo = productos.slice(0, 4);
    productosCombo.forEach((prod) => {
      data.push({
        id_promocion: promocionCombo.id_promocion,
        id_producto: prod.id_producto,
        precio_especial: 799.0 / 4,
        cantidad_requerida: 1,
      });
    });
  }

  // Cumpleañero - Postres
  const promocionCumple = promociones.find((p) =>
    p.nombre.includes('Cumpleañero'),
  );
  if (promocionCumple && categoriaPostres) {
    data.push({
      id_promocion: promocionCumple.id_promocion,
      id_categoria: categoriaPostres.id_categoria,
      precio_especial: 0,
      cantidad_requerida: 1,
    });
  }

  if (data.length > 0) {
    const result = await prisma.producto_promocion.createMany({
      data,
      skipDuplicates: true,
    });
    console.log(`✅ ${result.count} relaciones producto-promoción creadas`);
  } else {
    console.log(
      '⚠️  No se encontraron datos suficientes para crear relaciones',
    );
  }
}

if (require.main === module) {
  seedProductoPromocion()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
