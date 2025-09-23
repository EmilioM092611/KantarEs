import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  const command = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];

  switch (command) {
    case 'reset-password':
      if (!username || !password) {
        console.error('Uso: npm run user:reset-password <username> <password>');
        process.exit(1);
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      try {
        const user = await prisma.usuarios.update({
          where: { username },
          data: { 
            password_hash: hashedPassword,
            intentos_fallidos: 0,
            bloqueado_hasta: null
          }
        });
        
        console.log(`✅ Contraseña actualizada para: ${username}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Nueva contraseña: ${password}`);
        
      } catch (error) {
        console.error(`❌ Error: Usuario '${username}' no encontrado`);
      }
      break;
      
    case 'create':
      // Aquí podrías agregar lógica para crear usuarios
      console.log('Comando create no implementado aún');
      break;
      
    case 'list':
      const users = await prisma.usuarios.findMany({
        select: {
          username: true,
          email: true,
          activo: true,
          roles: {
            select: { nombre: true }
          }
        }
      });
      
      console.table(users.map(u => ({
        Usuario: u.username,
        Email: u.email,
        Rol: u.roles?.nombre,
        Activo: u.activo ? 'Sí' : 'No'
      })));
      break;
      
    case 'create-admin':
      const newUsername = process.argv[3];
      const newPassword = process.argv[4];
      const email = process.argv[5];
      
      if (!newUsername || !newPassword || !email) {
        console.error('Uso: npm run user:create-admin <username> <password> <email>');
        process.exit(1);
      }
      
      try {
        const hashedPass = await bcrypt.hash(newPassword, 10);
        
        // Verificar si el usuario ya existe
        const existingUser = await prisma.usuarios.findFirst({
          where: {
            OR: [
              { username: newUsername },
              { email: email }
            ]
          }
        });
        
        if (existingUser) {
          console.error(`❌ Error: El usuario '${newUsername}' o el email '${email}' ya existe`);
          process.exit(1);
        }
        
        // Primero crear la persona
        const persona = await prisma.personas.create({
          data: {
            nombre: 'Administrador',
            apellido_paterno: 'KantarEs',
            apellido_materno: 'System',
            id_genero: 1
          }
        });
        
        // Luego crear el usuario
        const newAdmin = await prisma.usuarios.create({
          data: {
            username: newUsername,
            password_hash: hashedPass,
            email: email,
            id_persona: persona.id_persona,
            id_rol: 1, // ID del rol Administrador
            pin_rapido: '0000',
            activo: true
          }
        });
        
        console.log(`✅ Nuevo administrador creado exitosamente:`);
        console.log(`   👤 Usuario: ${newUsername}`);
        console.log(`   🔑 Contraseña: ${newPassword}`);
        console.log(`   📧 Email: ${email}`);
        
        // Opcional: Desactivar el admin anterior
        const oldAdmin = await prisma.usuarios.update({
          where: { username: 'admin' },
          data: { activo: false }
        });
        
        if (oldAdmin) {
          console.log(`\n⚠️  Usuario 'admin' desactivado por seguridad`);
        }
        
      } catch (error: any) {
        console.error(`❌ Error al crear administrador:`, error.message);
        if (error.code === 'P2002') {
          console.error('   El username o email ya existe');
        }
        process.exit(1);
      }
      break;
      
    default:
      console.log('Comandos disponibles:');
      console.log('  reset-password <username> <password> - Resetear contraseña');
      console.log('  list - Listar usuarios');
      console.log('  create - Crear usuario (próximamente)');
      console.log('  create-admin <username> <password> <email> - Crear nuevo administrador');
  }
  
  await app.close();
}

bootstrap().catch(console.error);
