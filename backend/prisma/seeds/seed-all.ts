/* eslint-disable @typescript-eslint/require-await */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function runSeed(seedFile: string) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Ejecutando: ${seedFile}`);
  console.log('='.repeat(50));

  try {
    execSync(`npx ts-node prisma/seeds/${seedFile}`, {
      stdio: 'inherit',
    });
    console.log(`✅ ${seedFile} completado\n`);
  } catch (error) {
    console.error(`❌ Error en ${seedFile}:`, error);
    throw error;
  }
}

async function seedAll() {
  console.log('\n🚀 Iniciando inserción de datos en la BD...\n');

  const startTime = Date.now();

  try {
    // 1. Categorías (depende de tipos_producto que ya existe en SQL)
    await runSeed('seed-categorias.ts');

    // 2. Productos (depende de categorías y unidades_medida)
    await runSeed('seed-productos.ts');

    // 3. Usuarios y personas
    await runSeed('seed-usuarios.ts');

    // 4. Proveedores
    await runSeed('seed-proveedores.ts');

    // 5. Mesas (si no lo has ejecutado ya)
    // await runSeed('seed-mesas.ts');

    // 6. Estados de orden (si no lo has ejecutado ya)
    // await runSeed('seed-ordenes.ts');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 POBLACIÓN COMPLETA');
    console.log('='.repeat(50));
    console.log(`⏱️  Tiempo total: ${duration} segundos`);
    console.log('\n📊 Resumen de datos creados:');
    console.log('----------------------------');

    // Contar registros
    const categorias = await prisma.categorias.count();
    const productos = await prisma.productos.count();
    const usuarios = await prisma.usuarios.count();
    const proveedores = await prisma.proveedores.count();
    const mesas = await prisma.mesas.count();

    console.log(`Categorías:  ${categorias}`);
    console.log(`Productos:   ${productos}`);
    console.log(`Usuarios:    ${usuarios}`);
    console.log(`Proveedores: ${proveedores}`);
    console.log(`Mesas:       ${mesas}`);
    console.log('----------------------------\n');

    console.log('🔐 Credenciales de acceso:');
    console.log('==========================');
    console.log('ROL            | USUARIO          | CONTRASEÑA');
    console.log('---------------|------------------|-------------');
    console.log('Administrador  | admin            | admin123');
    console.log('Gerente        | maria.gonzalez   | gerente123');
    console.log('Cajero         | carlos.ramirez   | cajero123');
    console.log('Cajero         | laura.martinez   | cajero123');
    console.log('Mesero         | juan.perez       | mesero123');
    console.log('Mesero         | ana.hernandez    | mesero123');
    console.log('Mesero         | roberto.diaz     | mesero123');
    console.log('Mesero         | sofia.jimenez    | mesero123');
    console.log('Cocinero       | miguel.vargas    | cocinero123');
    console.log('Cocinero       | carmen.flores    | cocinero123');
    console.log('Bartender      | daniel.reyes     | bartender123');
    console.log('==========================\n');
  } catch (error) {
    console.error('\n❌ Error durante la población:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll();
