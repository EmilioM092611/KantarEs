/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Param,
  Query,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginAttemptsService } from './login-attempts/login-attempts.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private loginAttemptsService: LoginAttemptsService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 201, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({
    status: 423,
    description: 'Cuenta bloqueada por intentos fallidos',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
  }

  // === MEJORA 11: Endpoints de login_attempts ===

  @UseGuards(JwtAuthGuard)
  @Get('login-attempts/stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener estadísticas de intentos fallidos (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de intentos fallidos',
  })
  async getLoginStats(@Query('hours') hours?: string) {
    const stats = await this.loginAttemptsService.getFailedAttemptsStats(
      hours ? parseInt(hours) : 24,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-attempts/user/:username')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener historial de intentos de un usuario' })
  @ApiResponse({ status: 200, description: 'Historial de intentos' })
  async getUserAttempts(
    @Param('username') username: string,
    @Query('limit') limit?: string,
  ) {
    const attempts = await this.loginAttemptsService.getUserAttempts(
      username,
      limit ? parseInt(limit) : 20,
    );
    return {
      success: true,
      data: attempts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('unlock/:username')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Desbloquear cuenta manualmente (Admin)',
  })
  @ApiResponse({ status: 200, description: 'Cuenta desbloqueada' })
  async unlockAccount(@Param('username') username: string) {
    await this.loginAttemptsService.resetAttempts(username);
    return {
      success: true,
      message: `Cuenta ${username} desbloqueada exitosamente`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('cleanup-attempts')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Limpiar intentos antiguos (Admin/Cron)',
  })
  @ApiResponse({ status: 200, description: 'Intentos limpiados' })
  async cleanupAttempts() {
    const count = await this.loginAttemptsService.cleanupOldAttempts();
    return {
      success: true,
      message: `Se limpiaron ${count} intentos antiguos`,
    };
  }
}
