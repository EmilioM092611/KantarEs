/* eslint-disable @typescript-eslint/no-unused-vars */
// src/health/prisma.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key = 'database') {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      const result = this.getStatus(key, false);
      throw new HealthCheckError('Prisma check failed', result);
    }
  }
}
