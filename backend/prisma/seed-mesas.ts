/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMesas() {
  // Crear estados de mesa si no existen
  const estados = [
    {
      id_estado_mesa: 1,
      nombre: 'Disponible',
      color_hex: '#10B981',
      icono: 'check-circle',
    },
    {
      id_estado_mesa: 2,
      nombre: 'Ocupada',
      color_hex: '#EF4444',
      icono: 'users',
    },
    {
      id_estado_mesa: 3,
      nombre: 'Reservada',
      color_hex: '#F59E0B',
      icono: 'calendar',
    },
    {
      id_estado_mesa: 4,
      nombre: 'Por limpiar',
      color_hex: '#6B7280',
      icono: 'trash',
    },
    {
      id_estado_mesa: 5,
      nombre: 'En mantenimiento',
      color_hex: '#8B5CF6',
      icono: 'wrench',
    },
  ];

  for (const estado of estados) {
    await prisma.estados_mesa.upsert({
      where: { id_estado_mesa: estado.id_estado_mesa },
      update: {},
      create: estado,
    });
  }

  // Crear mesas de ejemplo
  const mesas = [
    // Planta Baja - Interior
    {
      numero_mesa: 'A1',
      capacidad_personas: 2,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 100,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'A2',
      capacidad_personas: 2,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 200,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'A3',
      capacidad_personas: 4,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 300,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'A4',
      capacidad_personas: 4,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 400,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'B1',
      capacidad_personas: 6,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 100,
      coordenada_y: 200,
    },
    {
      numero_mesa: 'B2',
      capacidad_personas: 6,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 200,
      coordenada_y: 200,
    },
    {
      numero_mesa: 'B3',
      capacidad_personas: 4,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 300,
      coordenada_y: 200,
    },
    {
      numero_mesa: 'B4',
      capacidad_personas: 4,
      ubicacion: 'Interior',
      planta: 1,
      coordenada_x: 400,
      coordenada_y: 200,
    },

    // Terraza
    {
      numero_mesa: 'T1',
      capacidad_personas: 4,
      ubicacion: 'Terraza',
      planta: 1,
      coordenada_x: 100,
      coordenada_y: 300,
    },
    {
      numero_mesa: 'T2',
      capacidad_personas: 4,
      ubicacion: 'Terraza',
      planta: 1,
      coordenada_x: 200,
      coordenada_y: 300,
    },
    {
      numero_mesa: 'T3',
      capacidad_personas: 2,
      ubicacion: 'Terraza',
      planta: 1,
      coordenada_x: 300,
      coordenada_y: 300,
    },
    {
      numero_mesa: 'T4',
      capacidad_personas: 2,
      ubicacion: 'Terraza',
      planta: 1,
      coordenada_x: 400,
      coordenada_y: 300,
    },

    // Segundo Piso
    {
      numero_mesa: 'P1',
      capacidad_personas: 8,
      ubicacion: 'Salón VIP',
      planta: 2,
      coordenada_x: 100,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'P2',
      capacidad_personas: 8,
      ubicacion: 'Salón VIP',
      planta: 2,
      coordenada_x: 200,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'P3',
      capacidad_personas: 10,
      ubicacion: 'Salón Privado',
      planta: 2,
      coordenada_x: 300,
      coordenada_y: 100,
    },

    // Barra
    {
      numero_mesa: 'BAR1',
      capacidad_personas: 1,
      ubicacion: 'Barra',
      planta: 1,
      coordenada_x: 500,
      coordenada_y: 100,
    },
    {
      numero_mesa: 'BAR2',
      capacidad_personas: 1,
      ubicacion: 'Barra',
      planta: 1,
      coordenada_x: 500,
      coordenada_y: 150,
    },
    {
      numero_mesa: 'BAR3',
      capacidad_personas: 1,
      ubicacion: 'Barra',
      planta: 1,
      coordenada_x: 500,
      coordenada_y: 200,
    },
    {
      numero_mesa: 'BAR4',
      capacidad_personas: 1,
      ubicacion: 'Barra',
      planta: 1,
      coordenada_x: 500,
      coordenada_y: 250,
    },
    {
      numero_mesa: 'BAR5',
      capacidad_personas: 1,
      ubicacion: 'Barra',
      planta: 1,
      coordenada_x: 500,
      coordenada_y: 300,
    },
  ];

  console.log('🌱 Creando mesas...');

  for (const mesa of mesas) {
    await prisma.mesas.upsert({
      where: { numero_mesa: mesa.numero_mesa },
      update: {},
      create: {
        ...mesa,
        id_estado_mesa: 1, // Disponible por defecto
        activa: true,
        requiere_limpieza: false,
      },
    });
  }

  console.log('✅ Mesas creadas exitosamente');
}

seedMesas()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
