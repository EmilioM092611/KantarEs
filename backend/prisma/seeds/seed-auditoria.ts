/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAuditoria() {
  console.log('🔍 Seeding auditoria_sistema...');

  // 🗑️ Limpiar datos existentes
  console.log('   Limpiando auditoría existente...');
  await prisma.auditoria_sistema.deleteMany({});

  const usuarios = await prisma.usuarios.findMany({
    where: { activo: true },
  });

  const productos = await prisma.productos.findMany({ take: 5 });
  const ordenes = await prisma.ordenes.findMany({ take: 5 });

  if (!usuarios.length) {
    console.log('⚠️  No hay usuarios disponibles');
    return;
  }

  const acciones: Array<'INSERT' | 'UPDATE' | 'DELETE'> = [
    'INSERT',
    'UPDATE',
    'DELETE',
  ];
  const tablas = [
    'productos',
    'ordenes',
    'pagos',
    'usuarios',
    'mesas',
    'inventario',
  ];

  const registrosAuditoria: Array<{
    tabla_afectada: string;
    id_registro: number;
    accion: 'INSERT' | 'UPDATE' | 'DELETE';
    id_usuario: number;
    valores_anteriores: any;
    valores_nuevos: any;
    ip_address: string;
    user_agent: string;
    fecha_hora: Date;
  }> = [];

  // Crear 50 registros de auditoría variados
  for (let i = 0; i < 50; i++) {
    const fechaAuditoria = new Date();
    fechaAuditoria.setDate(
      fechaAuditoria.getDate() - Math.floor(Math.random() * 30),
    );
    fechaAuditoria.setHours(Math.floor(Math.random() * 24));
    fechaAuditoria.setMinutes(Math.floor(Math.random() * 60));

    const accion = acciones[Math.floor(Math.random() * acciones.length)];
    const tabla = tablas[Math.floor(Math.random() * tablas.length)];
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

    let valores_anteriores: any = null;
    let valores_nuevos: any = null;

    // Generar valores según la acción
    switch (accion) {
      case 'INSERT':
        valores_nuevos = {
          campo_ejemplo: 'valor_nuevo',
          timestamp: fechaAuditoria.toISOString(),
        };
        break;

      case 'UPDATE':
        valores_anteriores = {
          precio: 100.0,
          disponible: true,
        };
        valores_nuevos = {
          precio: 120.0,
          disponible: true,
        };
        break;

      case 'DELETE':
        valores_anteriores = {
          id: Math.floor(Math.random() * 100),
          activo: true,
        };
        break;
    }

    registrosAuditoria.push({
      tabla_afectada: tabla,
      id_registro: Math.floor(Math.random() * 1000) + 1,
      accion: accion,
      id_usuario: usuario.id_usuario,
      valores_anteriores: valores_anteriores,
      valores_nuevos: valores_nuevos,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      ][Math.floor(Math.random() * 3)],
      fecha_hora: fechaAuditoria,
    });
  }

  const result = await prisma.auditoria_sistema.createMany({
    data: registrosAuditoria,
    skipDuplicates: true,
  });

  console.log(`✅ ${result.count} registros de auditoría creados`);

  // Mostrar estadísticas
  const stats = await prisma.auditoria_sistema.groupBy({
    by: ['accion'],
    _count: true,
  });

  console.log('\n📊 Estadísticas de auditoría:');
  stats.forEach((stat) => {
    console.log(`   ${stat.accion}: ${stat._count} registros`);
  });
}

if (require.main === module) {
  seedAuditoria()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
