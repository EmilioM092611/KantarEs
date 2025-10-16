/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCuentasCobrar() {
  console.log('💳 Seeding cuentas_cobrar y cc_movimientos...');

  // 🗑️ Limpiar datos existentes en orden correcto
  console.log('   Limpiando cuentas por cobrar existentes...');
  await prisma.cc_movimientos.deleteMany({});
  await prisma.cuentas_cobrar.deleteMany({});

  const personas = await prisma.personas.findMany();

  if (!personas.length) {
    console.log('⚠️  No hay personas disponibles');
    return;
  }

  // Crear 5 cuentas por cobrar
  for (let i = 0; i < 5; i++) {
    const persona = personas[Math.floor(Math.random() * personas.length)];
    const montoInicial = Math.random() * 5000 + 1000; // Entre 1000 y 6000

    const fechaCreacion = new Date();
    fechaCreacion.setDate(
      fechaCreacion.getDate() - Math.floor(Math.random() * 60),
    ); // Últimos 60 días

    const vencimiento = new Date(fechaCreacion);
    vencimiento.setDate(vencimiento.getDate() + 30); // 30 días de crédito

    // Generar referencia única
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const referencia = `CC-${timestamp}-${random}`;

    const cuenta = await prisma.cuentas_cobrar.create({
      data: {
        id_persona: persona.id_persona,
        referencia: referencia,
        saldo: montoInicial,
        vencimiento: vencimiento,
        estado: 'abierta',
        created_at: fechaCreacion,
      },
    });

    // Crear cargo inicial
    await prisma.cc_movimientos.create({
      data: {
        id_cc: cuenta.id_cc,
        tipo: 'cargo',
        monto: montoInicial,
        fecha: fechaCreacion,
        referencia: 'Cargo inicial - Crédito otorgado',
      },
    });

    // Crear algunos abonos (2-5 abonos aleatorios)
    const numAbonos = Math.floor(Math.random() * 4) + 2;
    let saldoActual = montoInicial;

    for (let j = 0; j < numAbonos; j++) {
      const fechaAbono = new Date(fechaCreacion);
      fechaAbono.setDate(fechaAbono.getDate() + (j + 1) * 7); // Cada 7 días

      const montoAbono = Math.min(
        saldoActual,
        Math.random() * (saldoActual * 0.4) + saldoActual * 0.1, // 10-50% del saldo
      );

      await prisma.cc_movimientos.create({
        data: {
          id_cc: cuenta.id_cc,
          tipo: 'abono',
          monto: montoAbono,
          fecha: fechaAbono,
          referencia: `Abono ${j + 1}`,
        },
      });

      saldoActual -= montoAbono;
    }

    // Actualizar saldo y estado de la cuenta
    const estadoFinal =
      saldoActual <= 0
        ? 'liquidada'
        : saldoActual < montoInicial * 0.3
          ? 'parcial'
          : 'abierta';

    await prisma.cuentas_cobrar.update({
      where: { id_cc: cuenta.id_cc },
      data: {
        saldo: saldoActual,
        estado: estadoFinal as any,
      },
    });

    console.log(
      `✅ Cuenta ${cuenta.referencia} creada - Saldo: $${saldoActual.toFixed(2)} (${estadoFinal})`,
    );
  }
}

if (require.main === module) {
  seedCuentasCobrar()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
