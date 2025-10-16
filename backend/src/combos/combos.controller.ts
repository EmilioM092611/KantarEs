// backend/src/productos/combos/combos.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { JwtAuthGuard } from '..//auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Combos')
@ApiBearerAuth('JWT-auth')
@Controller('productos/:idProducto/combos')
@UseGuards(JwtAuthGuard)
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener componentes del combo',
  })
  @ApiResponse({
    status: 200,
    description: 'Componentes del combo encontrados',
  })
  async getCombo(@Param('idProducto', ParseIntPipe) idProducto: number) {
    const combo = await this.combosService.getCombo(idProducto);
    return {
      success: true,
      data: combo,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Definir combo y sus componentes' })
  @ApiResponse({
    status: 201,
    description: 'Combo creado exitosamente',
  })
  async createCombo(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Body() createComboDto: CreateComboDto,
  ) {
    const combo = await this.combosService.createCombo(
      idProducto,
      createComboDto,
    );
    return {
      success: true,
      message: 'Combo creado exitosamente',
      data: combo,
    };
  }

  @Delete(':idComponente')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un componente del combo' })
  async deleteComponente(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Param('idComponente', ParseIntPipe) idComponente: number,
  ) {
    await this.combosService.deleteComponente(idComponente);
  }

  @Get('precio-calculado')
  @ApiOperation({
    summary: 'Calcular precio del combo basado en sus componentes',
  })
  async calcularPrecioCombo(
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ) {
    const precio = await this.combosService.calcularPrecioCombo(idProducto);
    return {
      success: true,
      data: precio,
    };
  }

  @Get('validar')
  @ApiOperation({
    summary: 'Validar combo (disponibilidad de componentes)',
  })
  async validarCombo(@Param('idProducto', ParseIntPipe) idProducto: number) {
    const validacion = await this.combosService.validarCombo(idProducto);
    return {
      success: true,
      data: validacion,
    };
  }
}
