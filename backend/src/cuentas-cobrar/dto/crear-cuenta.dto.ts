// crear-cuenta.dto.ts
export class CrearCuentaDto {
  id_persona!: number;
  referencia!: string;
  vencimiento?: string; // ISO date
}
