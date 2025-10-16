/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { LoginAttemptsService } from './login-attempts/login-attempts.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('JwtModule - Secret configurado:', secret ? '✅' : '❌');

        return {
          secret:
            secret ||
            '435ab20661e825b88481f6afebd5095ee5b6a971c82c7aec5572e325faf737c0',
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LoginAttemptsService, // ← AGREGADO
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, LoginAttemptsService], // ← EXPORTADO también
})
export class AuthModule {}
