// ============== pdate-mesa.dto.ts ==============
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMesaDto } from './create-mesa.dto';

export class UpdateMesaDto extends PartialType(
  OmitType(CreateMesaDto, ['numero_mesa'] as const),
) {}
