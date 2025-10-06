// /src/common/dto/pagination.dto.ts
import { IsIn, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @Min(0) skip = 0;
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive() take = 20;
  @IsOptional() @IsIn(['asc', 'desc']) order: 'asc' | 'desc' = 'desc';
  @IsOptional() sortBy = 'created_at';
}
