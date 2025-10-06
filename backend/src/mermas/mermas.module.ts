import { Module } from '@nestjs/common';
import { MermasController } from './mermas.controller';
import { MermasService } from './mermas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MermasController],
  providers: [MermasService, PrismaService],
})
export class MermasModule {}
