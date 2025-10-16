/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCFDI() {
  console.log('🧾 Seeding cfdi_receptores y cfdi_comprobantes...');

  // 🗑️ Limpiar datos existentes en orden correcto
  console.log('   Limpiando CFDI existentes...');
  await prisma.cfdi_comprobantes.deleteMany({});
  await prisma.cfdi_receptores.deleteMany({});

  // Crear receptores (clientes que solicitan factura)
  const receptores = await prisma.cfdi_receptores.createMany({
    data: [
      {
        rfc: 'XAXX010101000',
        razon_social: 'PUBLICO EN GENERAL',
        regimen_fiscal: '616', // Sin obligaciones fiscales
        uso_cfdi: 'G03', // Gastos en general
        email: 'facturacion@ejemplo.com',
      },
      {
        rfc: 'EKU9003173C9',
        razon_social: 'ESCUELA KEMPER URGATE SA DE CV',
        regimen_fiscal: '601', // General de Ley Personas Morales
        uso_cfdi: 'G03',
        email: 'contabilidad@kemper.edu.mx',
      },
      {
        rfc: 'CARL850101ABC',
        razon_social: 'CARLOS RODRIGUEZ LOPEZ',
        regimen_fiscal: '605', // Sueldos y Salarios
        uso_cfdi: 'G01', // Adquisición de mercancías
        email: 'carlos.rodriguez@email.com',
      },
      {
        rfc: 'MASS900215XYZ',
        razon_social: 'MARIA SANCHEZ SILVA',
        regimen_fiscal: '612', // Personas Físicas con Actividad Empresarial
        uso_cfdi: 'G02', // Devoluciones, descuentos o bonificaciones
        email: 'maria.sanchez@email.com',
      },
      {
        rfc: 'TEG7807054L6',
        razon_social: 'TECNOLOGIA EMPRESARIAL GLOBAL SA DE CV',
        regimen_fiscal: '601',
        uso_cfdi: 'G03',
        email: 'facturacion@teg.com.mx',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ ${receptores.count} receptores CFDI creados`);

  // Obtener órdenes pagadas para facturar
  const ordenesPagadas = await prisma.ordenes.findMany({
    where: {
      estados_orden: {
        nombre: 'Pagada',
      },
    },
    include: {
      estados_orden: true,
    },
    take: 10, // Facturar solo 10 órdenes
  });

  const receptoresCreados = await prisma.cfdi_receptores.findMany();

  if (!ordenesPagadas.length || !receptoresCreados.length) {
    console.log('⚠️  No hay órdenes pagadas o receptores disponibles');
    return;
  }

  // Crear comprobantes para algunas órdenes
  for (const orden of ordenesPagadas.slice(0, 5)) {
    const receptor =
      receptoresCreados[Math.floor(Math.random() * receptoresCreados.length)];

    const uuid =
      `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`.toUpperCase();

    const subtotal = Number(orden.subtotal);
    const iva = Number(orden.iva_monto);
    const total = Number(orden.total);

    const impuestos = {
      traslados: [
        {
          impuesto: '002', // IVA
          tipoFactor: 'Tasa',
          tasaOCuota: '0.160000',
          importe: iva.toFixed(2),
        },
      ],
    };

    await prisma.cfdi_comprobantes.create({
      data: {
        id_orden: orden.id_orden,
        id_receptor: receptor.id_receptor,
        tipo: 'I', // Ingreso
        serie: 'A',
        folio: String(orden.id_orden).padStart(6, '0'),
        uuid: uuid,
        estatus: 'timbrado',
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        fecha_emision: orden.fecha_hora_orden,
        xml: `<?xml version="1.0" encoding="UTF-8"?><!-- CFDI de ejemplo -->`,
        pdf_url: `https://storage.ejemplo.com/cfdi/${uuid}.pdf`,
      },
    });

    console.log(
      `✅ CFDI ${uuid.substring(0, 20)}... creado para orden ${orden.folio}`,
    );
  }
}

if (require.main === module) {
  seedCFDI()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
