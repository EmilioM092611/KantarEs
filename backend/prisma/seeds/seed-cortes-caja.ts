/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCortesCaja() {
  console.log('💵 Seeding cortes_caja...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando cortes de caja existentes...');
  await prisma.cortes_caja.deleteMany({});

  const usuarios = await prisma.usuarios.findMany({
    where: { activo: true },
  });

  const tiposCorte = await prisma.tipos_corte.findMany();

  if (!usuarios.length || !tiposCorte.length) {
    console.log('⚠️  No hay usuarios o tipos de corte disponibles');
    return;
  }

  const cajero = usuarios.find((u) => u.id_rol === 3); // Cajero
  const gerente = usuarios.find((u) => u.id_rol === 2); // Gerente

  // Crear cortes de los últimos 7 días
  for (let dia = 6; dia >= 0; dia--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dia);

    // Generar folios únicos CORTOS (máximo 30 caracteres)
    const año = String(fecha.getFullYear()).slice(-2);
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaStr = String(fecha.getDate()).padStart(2, '0');
    const randomX = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const randomZ = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    // Corte X (parcial) - mediodía
    const inicioCorteX = new Date(fecha);
    inicioCorteX.setHours(8, 0, 0, 0);
    const finCorteX = new Date(fecha);
    finCorteX.setHours(16, 0, 0, 0);

    const folioCorteX = `CX${año}${mes}${diaStr}${randomX}`; // Formato: CX25101612 (10 caracteres)

    // Obtener pagos del periodo
    const pagosCorteX = await prisma.pagos.findMany({
      where: {
        fecha_hora_pago: {
          gte: inicioCorteX,
          lte: finCorteX,
        },
        estado: 'completado',
      },
      include: {
        metodos_pago: true,
      },
    });

    const totalVentasX = pagosCorteX.reduce(
      (sum, p) => sum + Number(p.monto),
      0,
    );
    const totalEfectivoX = pagosCorteX
      .filter((p) => p.metodos_pago.nombre.toLowerCase().includes('efectivo'))
      .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalTarjetaX = pagosCorteX
      .filter((p) => p.metodos_pago.nombre.toLowerCase().includes('tarjeta'))
      .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalOtrosX = totalVentasX - totalEfectivoX - totalTarjetaX;

    const efectivoContadoX = totalEfectivoX + (Math.random() * 100 - 50); // Pequeña diferencia
    const diferenciaX = efectivoContadoX - totalEfectivoX;

    await prisma.cortes_caja.create({
      data: {
        folio_corte: folioCorteX,
        id_tipo_corte:
          tiposCorte.find((t) => t.nombre === 'Corte X')?.id_tipo_corte || 1,
        id_usuario_realiza: cajero?.id_usuario || usuarios[0].id_usuario,
        fecha_hora_inicio: inicioCorteX,
        fecha_hora_fin: finCorteX,
        total_ventas_sistema: totalVentasX,
        total_efectivo_sistema: totalEfectivoX,
        total_tarjeta_sistema: totalTarjetaX,
        total_otros_sistema: totalOtrosX,
        efectivo_contado: efectivoContadoX,
        efectivo_diferencia: diferenciaX,
        fondo_caja_inicial: 1000.0,
        fondo_caja_final: efectivoContadoX,
        numero_transacciones: pagosCorteX.length,
        estado: 'cerrado',
      },
    });

    // Corte Z (total) - cierre del día
    const inicioCorteZ = new Date(fecha);
    inicioCorteZ.setHours(8, 0, 0, 0);
    const finCorteZ = new Date(fecha);
    finCorteZ.setHours(23, 59, 59, 999);

    const folioCorteZ = `CZ${año}${mes}${diaStr}${randomZ}`; // Formato: CZ25101612 (10 caracteres)

    const pagosCorteZ = await prisma.pagos.findMany({
      where: {
        fecha_hora_pago: {
          gte: inicioCorteZ,
          lte: finCorteZ,
        },
        estado: 'completado',
      },
      include: {
        metodos_pago: true,
      },
    });

    const totalVentasZ = pagosCorteZ.reduce(
      (sum, p) => sum + Number(p.monto),
      0,
    );
    const totalEfectivoZ = pagosCorteZ
      .filter((p) => p.metodos_pago.nombre.toLowerCase().includes('efectivo'))
      .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalTarjetaZ = pagosCorteZ
      .filter((p) => p.metodos_pago.nombre.toLowerCase().includes('tarjeta'))
      .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalOtrosZ = totalVentasZ - totalEfectivoZ - totalTarjetaZ;

    const efectivoContadoZ = totalEfectivoZ + (Math.random() * 150 - 75);
    const diferenciaZ = efectivoContadoZ - totalEfectivoZ;

    await prisma.cortes_caja.create({
      data: {
        folio_corte: folioCorteZ,
        id_tipo_corte:
          tiposCorte.find((t) => t.nombre === 'Corte Z')?.id_tipo_corte || 2,
        id_usuario_realiza: cajero?.id_usuario || usuarios[0].id_usuario,
        id_usuario_autoriza: gerente?.id_usuario,
        fecha_hora_inicio: inicioCorteZ,
        fecha_hora_fin: finCorteZ,
        total_ventas_sistema: totalVentasZ,
        total_efectivo_sistema: totalEfectivoZ,
        total_tarjeta_sistema: totalTarjetaZ,
        total_otros_sistema: totalOtrosZ,
        efectivo_contado: efectivoContadoZ,
        efectivo_diferencia: diferenciaZ,
        fondo_caja_inicial: 1000.0,
        fondo_caja_final: efectivoContadoZ,
        retiros_efectivo: Math.floor(Math.random() * 2000),
        gastos_caja: Math.floor(Math.random() * 500),
        numero_transacciones: pagosCorteZ.length,
        estado: 'cerrado',
      },
    });

    console.log(
      `✅ Cortes del ${fecha.toLocaleDateString()} creados: ${totalVentasZ.toFixed(2)}`,
    );
  }
}

if (require.main === module) {
  seedCortesCaja()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
