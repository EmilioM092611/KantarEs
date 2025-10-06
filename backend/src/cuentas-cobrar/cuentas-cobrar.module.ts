// /src/cuentas-cobrar/cuentas-cobrar.module.ts
import { Module } from '@nestjs/common';
import { CuentasCobrarController } from './cuentas-cobrar.controller';
import { CuentasCobrarService } from './cuentas-cobrar.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CuentasCobrarController],
  providers: [CuentasCobrarService, PrismaService],
})
export class CuentasCobrarModule {}
