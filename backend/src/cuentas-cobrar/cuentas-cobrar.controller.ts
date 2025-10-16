/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CuentasCobrarService } from './cuentas-cobrar.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cuentas por Cobrar')
@ApiBearerAuth('JWT-auth')
@Controller('cuentas-cobrar')
@UseGuards(JwtAuthGuard)
export class CuentasCobrarController {
  constructor(private readonly svc: CuentasCobrarService) {}

  // === MEJORA 10: CxC avanzada y conciliación ===

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cuenta por cobrar para un cliente/persona',
  })
  @ApiResponse({
    status: 201,
    description: 'Cuenta creada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Persona no encontrada',
  })
  crearCuenta(@Body() dto: any) {
    return this.svc.crearCuenta(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cuentas por cobrar con filtros avanzados',
    description:
      'Filtros: estado, persona, rango de fechas, vencimiento. Incluye paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cuentas con totales',
  })
  listar(
    @Query()
    q: {
      estado?: 'abierta' | 'parcial' | 'liquidada';
      id_persona?: string;
      desde?: string;
      hasta?: string;
      vencidas?: 'true' | 'false';
      page?: string;
      limit?: string;
    },
  ) {
    return this.svc.listar(q);
  }

  @Get('resumen')
  @ApiOperation({
    summary: 'Obtener resumen de CxC (totales por estado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen con totales y antigüedad de saldos',
  })
  resumen() {
    return this.svc.getResumen();
  }

  @Get('antiguedad')
  @ApiOperation({
    summary: 'Reporte de antigüedad de saldos por cliente',
    description:
      'Clasifica saldos en: corriente, 1-30 días, 31-60 días, 61-90 días, >90 días',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de antigüedad',
  })
  antiguedadSaldos(@Query('id_persona') id_persona?: string) {
    return this.svc.reporteAntiguedad(
      id_persona ? parseInt(id_persona) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de una cuenta por cobrar con todos sus movimientos',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de cuenta con movimientos',
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
  })
  detalle(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detalle(id);
  }

  @Post(':id/cargo')
  @ApiOperation({
    summary: 'Registrar cargo (aumenta saldo de la cuenta)',
  })
  @ApiResponse({
    status: 201,
    description: 'Cargo registrado exitosamente',
  })
  cargo(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.cargo(id, dto);
  }

  @Post(':id/abono')
  @ApiOperation({
    summary: 'Registrar abono (disminuye saldo de la cuenta)',
  })
  @ApiResponse({
    status: 201,
    description: 'Abono registrado exitosamente',
  })
  abono(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.abono(id, dto);
  }

  @Post(':id/conciliar')
  @ApiOperation({
    summary: 'Conciliar cuenta con pagos del POS',
    description:
      'Liga movimientos de CxC con pagos registrados en el sistema POS',
  })
  @ApiResponse({
    status: 200,
    description: 'Conciliación completada',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la conciliación',
  })
  conciliar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { id_pago?: number; monto?: number },
  ) {
    return this.svc.conciliar(id, dto);
  }

  @Get('persona/:id_persona/cuentas')
  @ApiOperation({
    summary: 'Obtener todas las cuentas de un cliente específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuentas del cliente con totales',
  })
  cuentasPorCliente(@Param('id_persona', ParseIntPipe) id_persona: number) {
    return this.svc.getCuentasPorCliente(id_persona);
  }
}
