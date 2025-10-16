/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedProductoCombo() {
  console.log('🍱 Seeding producto_combo...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando combos existentes...');
  await prisma.producto_combo.deleteMany({});

  // Resetear flag es_combo en productos
  await prisma.productos.updateMany({
    where: { es_combo: true },
    data: { es_combo: false },
  });

  // Primero, marcar algunos productos como combos
  const productos = await prisma.productos.findMany({
    where: {
      es_vendible: true,
      disponible: true,
    },
  });

  if (productos.length < 10) {
    console.log('⚠️  No hay suficientes productos para crear combos');
    return;
  }

  // Crear 3 productos combo
  const combos = [];

  // Combo 1: Combo Ejecutivo
  const comboEjecutivo = productos.find((p) => p.es_combo) || productos[0];
  await prisma.productos.update({
    where: { id_producto: comboEjecutivo.id_producto },
    data: { es_combo: true, nombre: 'Combo Ejecutivo' },
  });

  // Componentes del combo ejecutivo
  const componentesEjecutivo = productos.slice(1, 4);
  for (let i = 0; i < componentesEjecutivo.length; i++) {
    await prisma.producto_combo.create({
      data: {
        id_producto_combo: comboEjecutivo.id_producto,
        id_producto_componente: componentesEjecutivo[i].id_producto,
        cantidad: 1,
        es_opcional: i === 2, // El tercer componente es opcional
        precio_adicional: i === 2 ? 50.0 : 0,
        grupo_opciones:
          i === 0 ? 'principal' : i === 1 ? 'acompañamiento' : 'extra',
        orden_visualizacion: i + 1,
      },
    });
  }
  console.log(
    `✅ Combo Ejecutivo creado con ${componentesEjecutivo.length} componentes`,
  );

  // Combo 2: Combo Familiar
  const comboFamiliar =
    productos.find((p, idx) => idx === 4 && p.es_combo) || productos[4];
  await prisma.productos.update({
    where: { id_producto: comboFamiliar.id_producto },
    data: { es_combo: true, nombre: 'Combo Familiar' },
  });

  const componentesFamiliar = productos.slice(5, 9);
  for (let i = 0; i < componentesFamiliar.length; i++) {
    await prisma.producto_combo.create({
      data: {
        id_producto_combo: comboFamiliar.id_producto,
        id_producto_componente: componentesFamiliar[i].id_producto,
        cantidad: i < 2 ? 2 : 1, // Los primeros 2 vienen por duplicado
        es_opcional: false,
        precio_adicional: 0,
        grupo_opciones: i < 2 ? 'platos_principales' : 'bebidas',
        orden_visualizacion: i + 1,
      },
    });
  }
  console.log(
    `✅ Combo Familiar creado con ${componentesFamiliar.length} componentes`,
  );

  // Combo 3: Combo Infantil
  if (productos.length >= 13) {
    const comboInfantil = productos[9];
    await prisma.productos.update({
      where: { id_producto: comboInfantil.id_producto },
      data: { es_combo: true, nombre: 'Combo Infantil' },
    });

    const componentesInfantil = productos.slice(10, 13);
    for (let i = 0; i < componentesInfantil.length; i++) {
      await prisma.producto_combo.create({
        data: {
          id_producto_combo: comboInfantil.id_producto,
          id_producto_componente: componentesInfantil[i].id_producto,
          cantidad: 1,
          es_opcional: i === 2, // Postre opcional
          precio_adicional: i === 2 ? 30.0 : 0,
          grupo_opciones: i === 0 ? 'plato' : i === 1 ? 'bebida' : 'postre',
          orden_visualizacion: i + 1,
        },
      });
    }
    console.log(
      `✅ Combo Infantil creado con ${componentesInfantil.length} componentes`,
    );
  }

  console.log('✅ Combos creados exitosamente');
}

if (require.main === module) {
  seedProductoCombo()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
