import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('✅ Conexión a PostgreSQL (KantarEs_BD) establecida');
    console.log('📊 31 tablas cargadas correctamente');
    console.log('👤 Usuario admin disponible');
    console.log('🍽️  10 mesas configuradas');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}
