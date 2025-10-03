// ============== seed-ordenes.ts ==============
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEstadosOrden() {
  console.log('🌱 Creando estados de orden...');

  const estados = [
    {
      id_estado_orden: 1,
      nombre: 'pendiente',
      descripcion: 'Orden nueva pendiente de confirmación',
      color_hex: '#FCD34D',
      siguiente_estado_permitido: 'confirmada,cancelada',
      notifica_cocina: false,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 2,
      nombre: 'confirmada',
      descripcion: 'Orden confirmada',
      color_hex: '#60A5FA',
      siguiente_estado_permitido: 'preparando,cancelada',
      notifica_cocina: true,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 3,
      nombre: 'preparando',
      descripcion: 'En preparación en cocina',
      color_hex: '#FB923C',
      siguiente_estado_permitido: 'lista,cancelada',
      notifica_cocina: false,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 4,
      nombre: 'lista',
      descripcion: 'Lista para servir',
      color_hex: '#A78BFA',
      siguiente_estado_permitido: 'servida,cancelada',
      notifica_cocina: false,
      notifica_cliente: true,
    },
    {
      id_estado_orden: 5,
      nombre: 'servida',
      descripcion: 'Servida al cliente',
      color_hex: '#34D399',
      siguiente_estado_permitido: 'por_pagar,pagada,cancelada',
      notifica_cocina: false,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 6,
      nombre: 'por_pagar',
      descripcion: 'Esperando pago',
      color_hex: '#FBBF24',
      siguiente_estado_permitido: 'pagada,cancelada',
      notifica_cocina: false,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 7,
      nombre: 'pagada',
      descripcion: 'Orden pagada',
      color_hex: '#10B981',
      siguiente_estado_permitido: '',
      notifica_cocina: false,
      notifica_cliente: false,
    },
    {
      id_estado_orden: 8,
      nombre: 'cancelada',
      descripcion: 'Orden cancelada',
      color_hex: '#EF4444',
      siguiente_estado_permitido: '',
      notifica_cocina: false,
      notifica_cliente: false,
    },
  ];

  for (const estado of estados) {
    await prisma.estados_orden.upsert({
      where: { id_estado_orden: estado.id_estado_orden },
      update: estado,
      create: estado,
    });
  }

  console.log('✅ Estados de orden creados');
}

async function main() {
  try {
    await seedEstadosOrden();

    console.log('✅ Seed de órdenes completado');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
