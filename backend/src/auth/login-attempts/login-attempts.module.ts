import { Module } from '@nestjs/common';
import { LoginAttemptsService } from './login-attempts.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LoginAttemptsService],
  exports: [LoginAttemptsService],
})
export class LoginAttemptsModule {}
