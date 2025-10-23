// backend/src/configuracion/configuracion.controller.ts

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConfiguracionService } from './configuracion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfiguracionAlertasDto } from './dto/configuracion-alertas.dto';
import { ConfiguracionFiscalDto } from './dto/configuracion-fiscal.dto';
import { ConfiguracionFoliosDto } from './dto/configuracion-folios.dto';
import { ConfiguracionGeneralDto } from './dto/configuracion-general.dto';
import { ConfiguracionOperativaDto } from './dto/configuracion-operativa.dto';
import { ConfiguracionTurnosDto } from './dto/configuracion-turnos.dto';

@ApiTags('Configuración del Sistema')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  // ==================== CONFIGURACIÓN GENERAL ====================

  @Get('general')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración general del restaurante' })
  @ApiResponse({
    status: 200,
    description: 'Configuración obtenida exitosamente',
  })
  async getGeneral() {
    const data = await this.configuracionService.getGeneral();
    return {
      success: true,
      data,
    };
  }

  @Put('general')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración general' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  async updateGeneral(@Body() dto: ConfiguracionGeneralDto) {
    const data = await this.configuracionService.updateGeneral(dto);
    return {
      success: true,
      message: 'Configuración general actualizada exitosamente',
      data,
    };
  }

  // ==================== CONFIGURACIÓN OPERATIVA ====================

  @Get('operativa')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración operativa' })
  async getOperativa() {
    const data = await this.configuracionService.getOperativa();
    return {
      success: true,
      data,
    };
  }

  @Put('operativa')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración operativa' })
  async updateOperativa(@Body() dto: ConfiguracionOperativaDto) {
    const data = await this.configuracionService.updateOperativa(dto);
    return {
      success: true,
      message: 'Configuración operativa actualizada exitosamente',
      data,
    };
  }

  // ==================== CONFIGURACIÓN FISCAL ====================

  @Get('fiscal')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración fiscal' })
  async getFiscal() {
    const data = await this.configuracionService.getFiscal();
    return {
      success: true,
      data,
    };
  }

  @Put('fiscal')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Actualizar configuración fiscal (IVA, IEPS, propinas)',
  })
  async updateFiscal(@Body() dto: ConfiguracionFiscalDto) {
    const data = await this.configuracionService.updateFiscal(dto);
    return {
      success: true,
      message: 'Configuración fiscal actualizada exitosamente',
      data,
    };
  }

  // ==================== CONFIGURACIÓN DE FOLIOS ====================

  @Get('folios')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración de folios' })
  async getFolios() {
    const data = await this.configuracionService.getFolios();
    return {
      success: true,
      data,
    };
  }

  @Put('folios')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración de folios' })
  async updateFolios(@Body() dto: ConfiguracionFoliosDto) {
    const data = await this.configuracionService.updateFolios(dto);
    return {
      success: true,
      message: 'Configuración de folios actualizada exitosamente',
      data,
    };
  }

  // ==================== CONFIGURACIÓN DE ALERTAS ====================

  @Get('alertas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración de alertas' })
  async getAlertas() {
    const data = await this.configuracionService.getAlertas();
    return {
      success: true,
      data,
    };
  }

  @Put('alertas')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración de alertas' })
  async updateAlertas(@Body() dto: ConfiguracionAlertasDto) {
    const data = await this.configuracionService.updateAlertas(dto);
    return {
      success: true,
      message: 'Configuración de alertas actualizada exitosamente',
      data,
    };
  }

  // ==================== CONFIGURACIÓN DE TURNOS ====================

  @Get('turnos')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener configuración de turnos' })
  async getTurnos() {
    const data = await this.configuracionService.getTurnos();
    return {
      success: true,
      data,
    };
  }

  @Put('turnos')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración de turnos' })
  async updateTurnos(@Body() dto: ConfiguracionTurnosDto) {
    const data = await this.configuracionService.updateTurnos(dto);
    return {
      success: true,
      message: 'Configuración de turnos actualizada exitosamente',
      data,
    };
  }

  // ==================== ENDPOINTS GLOBALES ====================

  @Get('todas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener todas las configuraciones del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Todas las configuraciones obtenidas',
  })
  async getTodasConfiguraciones() {
    const data = await this.configuracionService.getTodasConfiguraciones();
    return {
      success: true,
      data,
    };
  }

  @Post('restaurar-defaults')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar todas las configuraciones a valores por defecto',
    description:
      '⚠️ PRECAUCIÓN: Esto sobrescribirá todas las configuraciones actuales',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones restauradas exitosamente',
  })
  async restaurarDefaults() {
    const result = await this.configuracionService.restaurarDefaults();
    return {
      success: true,
      ...result,
    };
  }

  @Post('limpiar-cache')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Limpiar caché de configuración' })
  async limpiarCache() {
    const result = await this.configuracionService.limpiarCache();
    return {
      success: true,
      ...result,
    };
  }
}
