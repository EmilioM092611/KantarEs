import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule, // AuthModule para autenticacion
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
