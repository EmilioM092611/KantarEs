// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { PrismaService } from '../prisma/prisma.service';
import { CacheHealthController } from './cache-health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController, CacheHealthController],
  providers: [PrismaHealthIndicator, PrismaService],
})
export class HealthModule {}
