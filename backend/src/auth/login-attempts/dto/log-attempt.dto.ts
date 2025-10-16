// backend/src/auth/login-attempts/dto/log-attempt.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsIP } from 'class-validator';

export class LogAttemptDto {
  @ApiProperty({ example: 'jdoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: '192.168.1.100' })
  @IsIP()
  ip_address: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'Invalid password', required: false })
  @IsOptional()
  @IsString()
  failure_reason?: string;
}
