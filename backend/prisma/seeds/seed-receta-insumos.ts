/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRecetaInsumos() {
  console.log('📝 Seeding receta_insumos...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando recetas existentes...');
  await prisma.receta_insumos.deleteMany({});

  const productos = await prisma.productos.findMany({
    where: { es_vendible: true },
    include: { unidades_medida: true },
  });

  const insumos = await prisma.productos.findMany({
    where: { es_insumo: true },
    include: { unidades_medida: true },
  });

  if (!productos.length || !insumos.length) {
    console.log('⚠️  No hay suficientes productos o insumos');
    console.log('ℹ️  Tip: Marca algunos productos con es_insumo = true');

    // Crear algunas recetas de ejemplo con productos existentes
    const productosFinales = productos.slice(0, 5);
    const ingredientes = productos.slice(5, 10);

    for (const productoFinal of productosFinales) {
      // Cada producto final tiene 2-4 ingredientes
      const numIngredientes = Math.floor(Math.random() * 3) + 2;
      const ingredientesReceta = ingredientes
        .sort(() => 0.5 - Math.random())
        .slice(0, numIngredientes);

      for (const ingrediente of ingredientesReceta) {
        await prisma.receta_insumos.create({
          data: {
            id_producto_final: productoFinal.id_producto,
            id_insumo: ingrediente.id_producto,
            cantidad_necesaria: Math.random() * 0.5 + 0.1, // 0.1 - 0.6 unidades
            id_unidad_medida: ingrediente.id_unidad_medida,
            merma_esperada_porcentaje: Math.random() * 5, // 0-5% de merma
            notas_preparacion: `Agregar ${ingrediente.nombre} según la receta`,
          },
        });
      }

      console.log(`✅ Receta creada para ${productoFinal.nombre}`);
    }

    return;
  }

  // Si hay insumos definidos, crear recetas más elaboradas
  for (const producto of productos.slice(0, 10)) {
    const numInsumos = Math.floor(Math.random() * 4) + 2;
    const insumosReceta = insumos
      .sort(() => 0.5 - Math.random())
      .slice(0, numInsumos);

    for (const insumo of insumosReceta) {
      await prisma.receta_insumos.create({
        data: {
          id_producto_final: producto.id_producto,
          id_insumo: insumo.id_producto,
          cantidad_necesaria: Math.random() * 2 + 0.5,
          id_unidad_medida: insumo.id_unidad_medida,
          merma_esperada_porcentaje: Math.random() * 8,
          notas_preparacion: `Preparar ${insumo.nombre} según especificaciones`,
        },
      });
    }

    console.log(
      `✅ Receta creada para ${producto.nombre} con ${insumosReceta.length} insumos`,
    );
  }
}

if (require.main === module) {
  seedRecetaInsumos()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
