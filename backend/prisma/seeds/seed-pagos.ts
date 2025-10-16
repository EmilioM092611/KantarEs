/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPagos() {
  console.log('💰 Seeding pagos...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando pagos existentes...');
  await prisma.pagos.deleteMany({});

  // Obtener órdenes servidas o listas para pago
  const ordenes = await prisma.ordenes.findMany({
    include: {
      estados_orden: true,
    },
  });

  const metodosPago = await prisma.metodos_pago.findMany({
    where: { activo: true },
  });

  const usuarios = await prisma.usuarios.findMany({
    where: { activo: true },
  });

  const cajero = usuarios.find((u) => u.id_rol === 3); // Cajero

  if (!ordenes.length || !metodosPago.length) {
    console.log('⚠️  No hay órdenes o métodos de pago disponibles');
    return;
  }

  // Pagar algunas órdenes (50% aproximadamente)
  const ordenesAPagar = ordenes.slice(0, Math.ceil(ordenes.length / 2));

  for (const orden of ordenesAPagar) {
    const fechaPago = new Date(orden.fecha_hora_orden);
    fechaPago.setMinutes(fechaPago.getMinutes() + 30); // 30 min después de la orden

    // Generar folio único CORTO (máximo 30 caracteres para pagos)
    const año = String(fechaPago.getFullYear()).slice(-2);
    const mes = String(fechaPago.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaPago.getDate()).padStart(2, '0');
    const hora = String(fechaPago.getHours()).padStart(2, '0');
    const min = String(fechaPago.getMinutes()).padStart(2, '0');
    const seg = String(fechaPago.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const folioPago = `PAY${año}${mes}${dia}${hora}${min}${seg}${random}`; // Formato: PAY25101618304512 (16 caracteres)

    // Seleccionar método de pago aleatorio
    const metodoPago =
      metodosPago[Math.floor(Math.random() * metodosPago.length)];

    // Calcular propina (10-15% del total)
    const propina = Number(orden.total) * (Math.random() * 0.05 + 0.1);
    const montoTotal = Number(orden.total) + propina;

    const datosPago: any = {
      folio_pago: folioPago,
      id_orden: orden.id_orden,
      id_metodo_pago: metodoPago.id_metodo_pago,
      id_usuario_cobra: cajero?.id_usuario || usuarios[0].id_usuario,
      monto: montoTotal,
      fecha_hora_pago: fechaPago,
      estado: 'completado',
    };

    // Datos específicos según método de pago
    if (metodoPago.nombre.toLowerCase().includes('efectivo')) {
      const efectivoRecibido = Math.ceil(montoTotal / 100) * 100; // Redondeo a centena
      datosPago.cambio_entregado = efectivoRecibido - montoTotal;
    } else if (metodoPago.nombre.toLowerCase().includes('tarjeta')) {
      datosPago.referencia_transaccion = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      datosPago.numero_autorizacion = `AUTH${Math.floor(Math.random() * 1000000)}`;
      datosPago.ultimos_4_digitos = String(
        Math.floor(Math.random() * 10000),
      ).padStart(4, '0');
      datosPago.nombre_tarjetahabiente = 'CLIENTE EJEMPLO';
      datosPago.tipo_tarjeta = metodoPago.nombre.includes('Crédito')
        ? 'credito'
        : 'debito';
      datosPago.banco_emisor = ['BBVA', 'Santander', 'Banamex', 'HSBC'][
        Math.floor(Math.random() * 4)
      ];
    }

    await prisma.pagos.create({ data: datosPago });

    // Actualizar estado de la orden a 'Pagada'
    const estadoPagada = await prisma.estados_orden.findFirst({
      where: { nombre: 'Pagada' },
    });

    if (estadoPagada) {
      await prisma.ordenes.update({
        where: { id_orden: orden.id_orden },
        data: {
          id_estado_orden: estadoPagada.id_estado_orden,
          propina: propina,
        },
      });
    }

    console.log(`✅ Pago ${folioPago} registrado: $${montoTotal.toFixed(2)}`);
  }
}

if (require.main === module) {
  seedPagos()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
