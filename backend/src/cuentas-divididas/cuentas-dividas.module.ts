import { Module } from '@nestjs/common';
import { CuentasDivididasController } from './cuentas-divididas.controller';
import { CuentasDivididasService } from './cuentas-divididas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CuentasDivididasController],
  providers: [CuentasDivididasService, PrismaService],
})
export class CuentasDivididasModule {}
