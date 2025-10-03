//update-compra.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCompraDto } from './create-compra.dto';

export class UpdateCompraDto extends PartialType(
  OmitType(CreateCompraDto, ['detalle'] as const),
) {}
