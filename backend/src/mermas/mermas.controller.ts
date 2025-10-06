/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post } from '@nestjs/common';
import { MermasService } from './mermas.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Mermas')
@ApiBearerAuth('JWT-auth')
@Controller('mermas')
export class MermasController {
  constructor(private readonly svc: MermasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una merma de inventario' })
  crear(@Body() dto: any) {
    return this.svc.crear(dto);
  }
}
