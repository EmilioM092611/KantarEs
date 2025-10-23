// backend/src/configuracion/dto/configuracion-operativa.dto.ts

import { IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfiguracionOperativaDto {
  @ApiProperty({
    example: {
      lunes: { apertura: '09:00', cierre: '22:00', cerrado: false },
      martes: { apertura: '09:00', cierre: '22:00', cerrado: false },
    },
    description: 'Horarios por día de la semana',
  })
  @IsObject()
  horarios: {
    [dia: string]: {
      apertura: string;
      cierre: string;
      cerrado: boolean;
    };
  };

  @ApiProperty({
    example: 30,
    description: 'Tiempo de espera estimado en minutos',
  })
  @IsNumber()
  @Min(5)
  @Max(120)
  tiempo_espera_estimado: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  capacidad_maxima_personas: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  permite_reservaciones: boolean;

  @ApiProperty({
    example: 7,
    description: 'Días de anticipación para reservar',
  })
  @IsNumber()
  @Min(0)
  @Max(30)
  tiempo_anticipacion_reservaciones: number;

  @ApiProperty({
    example: 90,
    description: 'Duración promedio de comida en minutos',
  })
  @IsNumber()
  @Min(30)
  @Max(300)
  duracion_promedio_comida: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(5)
  @Max(60)
  alerta_tiempo_mesa_sin_atencion: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  @Max(60)
  tiempo_gracia_reservacion: number;
}
