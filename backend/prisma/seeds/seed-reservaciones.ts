/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedReservaciones() {
  console.log('📅 Seeding reservaciones...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando reservaciones existentes...');
  await prisma.reservaciones.deleteMany({});

  const mesas = await prisma.mesas.findMany({
    where: { activa: true },
  });

  if (!mesas.length) {
    console.log('⚠️  No hay mesas disponibles');
    return;
  }

  const nombresFicticios = [
    'Juan Pérez',
    'María González',
    'Carlos Rodríguez',
    'Ana Martínez',
    'Luis Hernández',
    'Sofia López',
    'Diego Ramírez',
    'Laura Torres',
    'Miguel Flores',
    'Valentina Morales',
  ];

  const telefonosFicticios = [
    '4421234567',
    '4427654321',
    '4429876543',
    '4423456789',
    '4428765432',
  ];

  // Crear reservaciones para los próximos 30 días
  const reservaciones: Array<{
    id_mesa: number;
    nombre_cliente: string;
    telefono: string;
    personas: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: any;
    notas: string | null;
  }> = [];

  for (let dia = 0; dia < 30; dia++) {
    // 2-5 reservaciones por día
    const numReservaciones = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numReservaciones; i++) {
      const fechaBase = new Date();
      fechaBase.setDate(fechaBase.getDate() + dia);

      // Horarios de reservación: 13:00-15:00 y 19:00-22:00
      const esComida = Math.random() > 0.5;
      const hora = esComida
        ? Math.floor(Math.random() * 3) + 13 // 13-15
        : Math.floor(Math.random() * 4) + 19; // 19-22

      fechaBase.setHours(hora, [0, 30][Math.floor(Math.random() * 2)], 0, 0);

      const fechaInicio = new Date(fechaBase);
      const fechaFin = new Date(fechaBase);
      fechaFin.setHours(fechaFin.getHours() + 2); // 2 horas de duración

      const mesa = mesas[Math.floor(Math.random() * mesas.length)];
      const personas =
        Math.floor(Math.random() * (mesa.capacidad_personas - 1)) + 2;

      // Determinar estado
      let estado: any = 'confirmada';
      if (dia < 0) {
        // Pasadas
        const rand = Math.random();
        estado = rand > 0.8 ? 'no_show' : rand > 0.1 ? 'cumplida' : 'cancelada';
      } else if (dia === 0) {
        // Hoy
        estado = Math.random() > 0.3 ? 'confirmada' : 'pendiente';
      } else {
        // Futuras
        estado = Math.random() > 0.2 ? 'confirmada' : 'pendiente';
      }

      reservaciones.push({
        id_mesa: mesa.id_mesa,
        nombre_cliente:
          nombresFicticios[Math.floor(Math.random() * nombresFicticios.length)],
        telefono:
          telefonosFicticios[
            Math.floor(Math.random() * telefonosFicticios.length)
          ],
        personas: personas,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: estado,
        notas: Math.random() > 0.7 ? 'Celebración especial' : null,
      });
    }
  }

  const result = await prisma.reservaciones.createMany({
    data: reservaciones,
    skipDuplicates: true,
  });

  console.log(`✅ ${result.count} reservaciones creadas`);
}

if (require.main === module) {
  seedReservaciones()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
