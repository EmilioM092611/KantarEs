/* eslint-disable @typescript-eslint/no-misused-promises */
// prisma/seeds/seed-usuarios.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsuarios() {
  console.log('🌱 Creando/actualizando usuarios...');

  const usuariosData = [
    {
      persona: {
        nombre: 'María',
        apellido_paterno: 'González',
        apellido_materno: 'López',
        fecha_nacimiento: new Date('1985-03-15'),
        id_genero: 2,
      },
      usuario: {
        username: 'maria.gonzalez',
        password: 'gerente123',
        email: 'maria.gonzalez@kantares.com',
        telefono: '4421234567',
        id_rol: 2,
        pin_rapido: '1234',
      },
    },
    {
      persona: {
        nombre: 'Carlos',
        apellido_paterno: 'Ramírez',
        apellido_materno: 'Torres',
        fecha_nacimiento: new Date('1992-07-20'),
        id_genero: 1,
      },
      usuario: {
        username: 'carlos.ramirez',
        password: 'cajero123',
        email: 'carlos.ramirez@kantares.com',
        telefono: '4421234568',
        id_rol: 3,
        pin_rapido: '2345',
      },
    },
    {
      persona: {
        nombre: 'Laura',
        apellido_paterno: 'Martínez',
        apellido_materno: 'Sánchez',
        fecha_nacimiento: new Date('1994-11-10'),
        id_genero: 2,
      },
      usuario: {
        username: 'laura.martinez',
        password: 'cajero123',
        email: 'laura.martinez@kantares.com',
        telefono: '4421234569',
        id_rol: 3,
        pin_rapido: '3456',
      },
    },
    {
      persona: {
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
        apellido_materno: 'García',
        fecha_nacimiento: new Date('1998-05-25'),
        id_genero: 1,
      },
      usuario: {
        username: 'juan.perez',
        password: 'mesero123',
        email: 'juan.perez@kantares.com',
        telefono: '4421234570',
        id_rol: 4,
        pin_rapido: '4567',
      },
    },
    {
      persona: {
        nombre: 'Ana',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Ruiz',
        fecha_nacimiento: new Date('1997-09-18'),
        id_genero: 2,
      },
      usuario: {
        username: 'ana.hernandez',
        password: 'mesero123',
        email: 'ana.hernandez@kantares.com',
        telefono: '4421234571',
        id_rol: 4,
        pin_rapido: '5678',
      },
    },
    {
      persona: {
        nombre: 'Roberto',
        apellido_paterno: 'Díaz',
        apellido_materno: 'Morales',
        fecha_nacimiento: new Date('1999-02-14'),
        id_genero: 1,
      },
      usuario: {
        username: 'roberto.diaz',
        password: 'mesero123',
        email: 'roberto.diaz@kantares.com',
        telefono: '4421234572',
        id_rol: 4,
        pin_rapido: '6789',
      },
    },
    {
      persona: {
        nombre: 'Sofía',
        apellido_paterno: 'Jiménez',
        apellido_materno: 'Castro',
        fecha_nacimiento: new Date('1996-08-22'),
        id_genero: 2,
      },
      usuario: {
        username: 'sofia.jimenez',
        password: 'mesero123',
        email: 'sofia.jimenez@kantares.com',
        telefono: '4421234573',
        id_rol: 4,
        pin_rapido: '7890',
      },
    },
    {
      persona: {
        nombre: 'Miguel',
        apellido_paterno: 'Vargas',
        apellido_materno: 'Ortiz',
        fecha_nacimiento: new Date('1988-04-12'),
        id_genero: 1,
      },
      usuario: {
        username: 'miguel.vargas',
        password: 'cocinero123',
        email: 'miguel.vargas@kantares.com',
        telefono: '4421234574',
        id_rol: 5,
        pin_rapido: '8901',
      },
    },
    {
      persona: {
        nombre: 'Carmen',
        apellido_paterno: 'Flores',
        apellido_materno: 'Mendoza',
        fecha_nacimiento: new Date('1990-12-05'),
        id_genero: 2,
      },
      usuario: {
        username: 'carmen.flores',
        password: 'cocinero123',
        email: 'carmen.flores@kantares.com',
        telefono: '4421234575',
        id_rol: 5,
        pin_rapido: '9012',
      },
    },
    {
      persona: {
        nombre: 'Daniel',
        apellido_paterno: 'Reyes',
        apellido_materno: 'Navarro',
        fecha_nacimiento: new Date('1993-06-30'),
        id_genero: 1,
      },
      usuario: {
        username: 'daniel.reyes',
        password: 'bartender123',
        email: 'daniel.reyes@kantares.com',
        telefono: '4421234576',
        id_rol: 6,
        pin_rapido: '0123',
      },
    },
  ];

  for (const data of usuariosData) {
    const { password, ...usuarioData } = data.usuario;
    const passwordHash = await bcrypt.hash(password, 10);

    // Buscar si el usuario ya existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { username: usuarioData.username },
      include: { personas: true },
    });

    if (usuarioExistente) {
      // Actualizar persona y usuario existentes
      await prisma.personas.update({
        where: { id_persona: usuarioExistente.id_persona },
        data: data.persona,
      });

      await prisma.usuarios.update({
        where: { username: usuarioData.username },
        data: {
          ...usuarioData,
          password_hash: passwordHash,
          activo: true,
        },
      });

      console.log(`🔄 Actualizado: ${usuarioData.username}`);
    } else {
      // Crear persona nueva
      const persona = await prisma.personas.create({
        data: data.persona,
      });

      // Crear usuario nuevo
      await prisma.usuarios.create({
        data: {
          ...usuarioData,
          password_hash: passwordHash,
          id_persona: persona.id_persona,
          activo: true,
          intentos_fallidos: 0,
        },
      });

      console.log(`✅ Creado: ${usuarioData.username}`);
    }
  }

  console.log('\n✅ Usuarios procesados exitosamente');
}

seedUsuarios()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
