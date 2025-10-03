/* eslint-disable @typescript-eslint/no-misused-promises */
// prisma/seeds/seed-categorias.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategorias() {
  console.log('🌱 Creando/actualizando categorías...');

  const categorias = [
    {
      nombre: 'Bebidas Frías',
      descripcion: 'Refrescos, jugos y bebidas heladas',
      id_tipo_producto: 1,
      orden_visualizacion: 1,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Bebidas Calientes',
      descripcion: 'Café, té y chocolate caliente',
      id_tipo_producto: 1,
      orden_visualizacion: 2,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Cervezas',
      descripcion: 'Cervezas nacionales e importadas',
      id_tipo_producto: 1,
      orden_visualizacion: 3,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Vinos',
      descripcion: 'Vinos tintos, blancos y rosados',
      id_tipo_producto: 1,
      orden_visualizacion: 4,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Cocteles',
      descripcion: 'Bebidas preparadas con alcohol',
      id_tipo_producto: 1,
      orden_visualizacion: 5,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Desayunos',
      descripcion: 'Platillos para el desayuno',
      id_tipo_producto: 2,
      orden_visualizacion: 6,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Ensaladas',
      descripcion: 'Ensaladas frescas y nutritivas',
      id_tipo_producto: 2,
      orden_visualizacion: 7,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Sopas',
      descripcion: 'Sopas y caldos',
      id_tipo_producto: 2,
      orden_visualizacion: 8,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Carnes',
      descripcion: 'Platillos de carne de res, cerdo y cordero',
      id_tipo_producto: 2,
      orden_visualizacion: 9,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Aves',
      descripcion: 'Platillos de pollo, pavo y pato',
      id_tipo_producto: 2,
      orden_visualizacion: 10,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Pescados y Mariscos',
      descripcion: 'Platillos del mar',
      id_tipo_producto: 2,
      orden_visualizacion: 11,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Pastas',
      descripcion: 'Pastas italianas',
      id_tipo_producto: 2,
      orden_visualizacion: 12,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Pizzas',
      descripcion: 'Pizzas artesanales',
      id_tipo_producto: 2,
      orden_visualizacion: 13,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Hamburguesas',
      descripcion: 'Hamburguesas gourmet',
      id_tipo_producto: 2,
      orden_visualizacion: 14,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Entradas Frías',
      descripcion: 'Aperitivos fríos',
      id_tipo_producto: 4,
      orden_visualizacion: 15,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Entradas Calientes',
      descripcion: 'Aperitivos calientes',
      id_tipo_producto: 4,
      orden_visualizacion: 16,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Postres Fríos',
      descripcion: 'Helados y postres refrigerados',
      id_tipo_producto: 3,
      orden_visualizacion: 17,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Postres Calientes',
      descripcion: 'Pasteles y postres horneados',
      id_tipo_producto: 3,
      orden_visualizacion: 18,
      visible_menu: true,
      activa: true,
    },
    {
      nombre: 'Botanas',
      descripcion: 'Snacks y botanas para compartir',
      id_tipo_producto: 5,
      orden_visualizacion: 19,
      visible_menu: true,
      activa: true,
    },
  ];

  for (const categoria of categorias) {
    const existe = await prisma.categorias.findFirst({
      where: { nombre: categoria.nombre },
    });

    if (existe) {
      // Actualizar categoría existente
      await prisma.categorias.update({
        where: { id_categoria: existe.id_categoria },
        data: categoria,
      });
      console.log(`🔄 Actualizada: ${categoria.nombre}`);
    } else {
      // Crear nueva categoría
      await prisma.categorias.create({
        data: categoria,
      });
      console.log(`✅ Creada: ${categoria.nombre}`);
    }
  }

  console.log('\n✅ Categorías procesadas exitosamente');
}

seedCategorias()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
