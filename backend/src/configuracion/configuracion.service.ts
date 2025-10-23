/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/configuracion/configuracion.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_VALUES } from './constants/defaults.constant';
import { ConfiguracionAlertasDto } from './dto/configuracion-alertas.dto';
import { ConfiguracionFiscalDto } from './dto/configuracion-fiscal.dto';
import { ConfiguracionFoliosDto } from './dto/configuracion-folios.dto';
import { ConfiguracionGeneralDto } from './dto/configuracion-general.dto';
import { ConfiguracionOperativaDto } from './dto/configuracion-operativa.dto';
import { ConfiguracionTurnosDto } from './dto/configuracion-turnos.dto';

@Injectable()
export class ConfiguracionService {
  private readonly logger = new Logger(ConfiguracionService.name);
  private configCache = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  // ==================== MÉTODOS GENÉRICOS ====================

  private async getConfiguracion(clave: string) {
    // Verificar caché
    if (this.configCache.has(clave)) {
      this.logger.debug(`Config '${clave}' obtenida desde caché`);
      return this.configCache.get(clave);
    }

    // Buscar en BD
    const config = await this.prisma.configuracion_sistema.findUnique({
      where: { clave, activo: true },
    });

    if (config) {
      this.configCache.set(clave, config.valor);
      return config.valor;
    }

    // Retornar default si no existe
    this.logger.warn(`Config '${clave}' no encontrada, usando defaults`);
    return DEFAULT_VALUES[clave] || null;
  }

  private async setConfiguracion(clave: string, seccion: string, valor: any) {
    const config = await this.prisma.configuracion_sistema.upsert({
      where: { clave },
      update: {
        valor,
        updated_at: new Date(),
      },
      create: {
        clave,
        seccion,
        valor,
        activo: true,
      },
    });

    // Actualizar caché
    this.configCache.set(clave, valor);

    this.logger.log(`Configuración '${clave}' actualizada`);
    return config.valor;
  }

  // ==================== CONFIGURACIÓN GENERAL ====================

  async getGeneral() {
    return this.getConfiguracion('general');
  }

  async updateGeneral(dto: ConfiguracionGeneralDto) {
    return this.setConfiguracion('general', 'informacion', dto);
  }

  // ==================== CONFIGURACIÓN OPERATIVA ====================

  async getOperativa() {
    return this.getConfiguracion('operativa');
  }

  async updateOperativa(dto: ConfiguracionOperativaDto) {
    return this.setConfiguracion('operativa', 'operacion', dto);
  }

  // ==================== CONFIGURACIÓN FISCAL ====================

  async getFiscal() {
    return this.getConfiguracion('fiscal');
  }

  async updateFiscal(dto: ConfiguracionFiscalDto) {
    return this.setConfiguracion('fiscal', 'impuestos', dto);
  }

  // ==================== CONFIGURACIÓN DE FOLIOS ====================

  async getFolios() {
    return this.getConfiguracion('folios');
  }

  async updateFolios(dto: ConfiguracionFoliosDto) {
    return this.setConfiguracion('folios', 'numeracion', dto);
  }

  // ==================== CONFIGURACIÓN DE ALERTAS ====================

  async getAlertas() {
    return this.getConfiguracion('alertas');
  }

  async updateAlertas(dto: ConfiguracionAlertasDto) {
    return this.setConfiguracion('alertas', 'notificaciones', dto);
  }

  // ==================== CONFIGURACIÓN DE TURNOS ====================

  async getTurnos() {
    return this.getConfiguracion('turnos');
  }

  async updateTurnos(dto: ConfiguracionTurnosDto) {
    return this.setConfiguracion('turnos', 'horarios', dto);
  }

  // ==================== MÉTODOS GLOBALES ====================

  async getTodasConfiguraciones() {
    return {
      general: await this.getGeneral(),
      operativa: await this.getOperativa(),
      fiscal: await this.getFiscal(),
      folios: await this.getFolios(),
      alertas: await this.getAlertas(),
      turnos: await this.getTurnos(),
    };
  }

  async restaurarDefaults() {
    this.logger.warn('Restaurando configuraciones a valores por defecto');

    const claves = Object.keys(DEFAULT_VALUES);

    for (const clave of claves) {
      await this.setConfiguracion(
        clave,
        this.getSeccionPorClave(clave),
        DEFAULT_VALUES[clave],
      );
    }

    // Limpiar caché
    this.configCache.clear();

    return {
      message: 'Configuraciones restauradas a valores por defecto',
      configuraciones_restauradas: claves,
    };
  }

  async limpiarCache() {
    this.configCache.clear();
    this.logger.log('Caché de configuración limpiada');
    return { message: 'Caché limpiada exitosamente' };
  }

  private getSeccionPorClave(clave: string): string {
    const mapa = {
      general: 'informacion',
      operativa: 'operacion',
      fiscal: 'impuestos',
      folios: 'numeracion',
      alertas: 'notificaciones',
      turnos: 'horarios',
    };
    return mapa[clave] || 'general';
  }
}
