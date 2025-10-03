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
import { MesasModule } from './mesas/mesas.module';
import { SesionesMesaModule } from './sesiones-mesas/sesiones-mesas.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { OrdenDetalleModule } from './orden-detalle/orden-detalle.module';
import { PagosModule } from './pagos/pagos.module';
import { MetodosPagoModule } from './metodos-pago/metodos-pago.module';
import { TiposCorteModule } from './tipos-corte/tipos-corte.module';
import { CortesCajaModule } from './cortes-caja/cortes-caja.module';
import { InventarioModule } from './inventario/inventario.module';

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
    MesasModule,
    SesionesMesaModule,
    OrdenesModule,
    OrdenDetalleModule,
    PagosModule,
    MetodosPagoModule,
    TiposCorteModule,
    CortesCajaModule,
    InventarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
