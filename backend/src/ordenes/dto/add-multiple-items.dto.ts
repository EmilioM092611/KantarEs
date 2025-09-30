// ============== add-multiple-items.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { AddItemDto } from './add-item.dto';

export class AddMultipleItemsDto {
  @ApiProperty({
    type: [AddItemDto],
    description: 'Lista de items a agregar',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddItemDto)
  items: AddItemDto[];
}
