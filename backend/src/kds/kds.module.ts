import { Module } from '@nestjs/common';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [KdsController],
  providers: [KdsService, PrismaService],
  exports: [KdsService],
})
export class KdsModule {}
