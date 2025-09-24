import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 👇 Endpoint de prueba
  @Get('test-db')
  async testDatabase() {
    const [usuarios, mesas, productos, categorias] = await Promise.all([
      this.prisma.usuarios.count(),
      this.prisma.mesas.count(),
      this.prisma.productos.count(),
      this.prisma.categorias.count(),
    ]);

    // Obtener info del usuario admin
    const adminUser = await this.prisma.usuarios.findFirst({
      where: { username: 'admin' },
      include: {
        personas: true,
        roles: true,
      },
    });

    return {
      mensaje: '✅ Conexión exitosa con KantarEs_BD',
      estadisticas: {
        usuarios_registrados: usuarios,
        mesas_disponibles: mesas,
        productos_en_menu: productos,
        categorias: categorias,
      },
      usuario_admin: adminUser
        ? {
            username: adminUser.username,
            email: adminUser.email,
            rol: adminUser.roles?.nombre,
          }
        : null,
    };
  }
}
