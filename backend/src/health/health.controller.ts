// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get('/health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.prisma.isHealthy()]);
  }

  // Alias de readiness (si lo quieres separado)
  @Get('/ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.prisma.isHealthy()]);
  }
}
