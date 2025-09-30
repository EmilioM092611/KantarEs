// ============== update-item.dto.ts ==============
import { PartialType, OmitType } from '@nestjs/swagger';
import { AddItemDto } from './add-item.dto';

export class UpdateItemDto extends PartialType(
  OmitType(AddItemDto, ['id_producto'] as const),
) {}
