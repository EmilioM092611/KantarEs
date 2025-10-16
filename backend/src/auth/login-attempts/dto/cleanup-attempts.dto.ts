import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class CleanupAttemptsDto {
  @ApiProperty({
    description: 'Días de antigüedad para eliminar intentos',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  days_old?: number;
}
