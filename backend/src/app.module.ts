// ============== app.module.ts (ACTUALIZADO) ==============
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UnidadesModule } from './unidades/unidades.module';
import { MesasModule } from './mesas/mesas.module'; // NUEVO
import { SesionesMesaModule } from './sesiones-mesas/sesiones-mesas.module'; // NUEVO
import { OrdenesModule } from './ordenes/ordenes.module';
import { OrdenDetalleModule } from './orden-detalle/orden-detalle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CategoriasModule,
    UnidadesModule,
    MesasModule, // NUEVO
    SesionesMesaModule, // NUEVO
    OrdenesModule,
    OrdenDetalleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
