# Módulo de Usuarios

## Descripción

El módulo de usuarios gestiona todo el personal del restaurante, incluyendo autenticación, permisos basados en roles, y administración de cuentas de usuario.

## Entidad Principal

### usuarios

```typescript
{
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string; // Único, usado para login
  password: string; // Hasheado con bcrypt
  rol: string; // 'Administrador', 'Gerente', 'Cajero', 'Mesero'
  telefono: string | null;
  fecha_contratacion: Date | null;
  activo: boolean;
  ultimo_acceso: Date | null;
  intentos_fallidos: number;
  bloqueado_hasta: Date | null;
  created_at: Date;
  updated_at: Date;
}
```

## Roles y Permisos

### Jerarquía de Roles

```
Administrador (nivel 4)
    ↓
Gerente (nivel 3)
    ↓
Cajero (nivel 2)
    ↓
Mesero (nivel 1)
```

### Matriz de Permisos

Ver documento: [flujo-autenticacion.md](../procesos/flujo-autenticacion.md)

## Estructura del Módulo

```
src/usuarios/
├── usuarios.controller.ts
├── usuarios.service.ts
├── usuarios.module.ts
└── dto/
    ├── create-usuario.dto.ts
    ├── update-usuario.dto.ts
    └── cambiar-password.dto.ts
```

## Endpoints Principales

### GET /usuarios

Listar todos los usuarios.

**Query Params**:

- `rol`: Filtrar por rol
- `activo`: Filtrar por estado
- `buscar`: Buscar por nombre o email

**Roles**: Administrador, Gerente (solo lectura)

**Response**:

```json
{
  "usuarios": [
    {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@kantares.com",
      "rol": "Administrador",
      "activo": true,
      "fecha_contratacion": "2024-01-15",
      "ultimo_acceso": "2025-10-08T09:30:00Z"
    },
    {
      "id_usuario": 2,
      "nombre": "María",
      "apellido": "López",
      "email": "maria.lopez@kantares.com",
      "rol": "Cajero",
      "activo": true,
      "fecha_contratacion": "2024-06-01",
      "ultimo_acceso": "2025-10-08T08:00:00Z"
    }
  ]
}
```

### GET /usuarios/:id

Obtener usuario específico.

**Roles**: Administrador, Gerente (solo lectura), Usuario mismo (su perfil)

**Response**:

```json
{
  "id_usuario": 2,
  "nombre": "María",
  "apellido": "López",
  "email": "maria.lopez@kantares.com",
  "rol": "Cajero",
  "telefono": "555-1234",
  "fecha_contratacion": "2024-06-01",
  "activo": true,
  "estadisticas": {
    "ordenes_procesadas": 1250,
    "total_vendido": 185420.5,
    "dias_trabajados": 130,
    "ultimo_acceso": "2025-10-08T08:00:00Z"
  },
  "permisos": {
    "puede_crear_ordenes": true,
    "puede_cancelar_ordenes": false,
    "puede_hacer_cortes": true,
    "puede_ver_reportes": false
  }
}
```

### POST /usuarios

Crear nuevo usuario.

**Roles**: Administrador

**Body**:

```json
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "email": "carlos.ramirez@kantares.com",
  "password": "Password123!",
  "rol": "Cajero",
  "telefono": "555-5678",
  "fecha_contratacion": "2025-10-01"
}
```

**Validaciones**:

- Email único
- Password cumple requisitos mínimos
- Rol válido
- Solo Administrador puede crear usuarios

**Proceso**:

1. Validar datos
2. Verificar email único
3. Hashear password con bcrypt
4. Crear usuario
5. Enviar credenciales por email (opcional)

### PATCH /usuarios/:id

Actualizar usuario.

**Roles**: Administrador

**Body** (campos opcionales):

```json
{
  "nombre": "Carlos Alberto",
  "telefono": "555-9999",
  "rol": "Gerente",
  "activo": true
}
```

**Restricciones**:

- No se puede cambiar el email
- No se puede cambiar password por este endpoint
- No puede desactivarse a sí mismo

### DELETE /usuarios/:id

Desactivar usuario (soft delete).

**Roles**: Administrador

**Proceso**:

- No elimina físicamente
- Cambia `activo = false`
- Cierra sesiones activas
- Mantiene histórico de operaciones

### POST /usuarios/:id/cambiar-password

Cambiar contraseña de usuario.

**Roles**: Administrador (para cualquier usuario), Usuario (para sí mismo)

**Body**:

```json
{
  "password_actual": "Password123!",
  "password_nueva": "NewPassword456!",
  "confirmar_password": "NewPassword456!"
}
```

**Validaciones**:

- Password actual correcta (si es el mismo usuario)
- Nueva password cumple requisitos
- Confirmación coincide
- Nueva password diferente a la actual

### POST /usuarios/:id/reset-password

Resetear contraseña (por administrador).

**Roles**: Administrador

**Body**:

```json
{
  "password_temporal": "Temp123!",
  "forzar_cambio": true
}
```

**Proceso**:

1. Generar password temporal
2. Hashear password
3. Actualizar usuario
4. Marcar para cambio obligatorio en próximo login
5. Enviar email con nueva password

### GET /usuarios/:id/actividad

Obtener log de actividad del usuario.

**Roles**: Administrador

**Response**:

```json
{
  "usuario": "María López",
  "actividades": [
    {
      "fecha": "2025-10-08T14:30:00Z",
      "accion": "login",
      "ip": "192.168.1.100",
      "exitoso": true
    },
    {
      "fecha": "2025-10-08T14:35:00Z",
      "accion": "crear_orden",
      "detalles": "Orden #ORD-123",
      "exitoso": true
    },
    {
      "fecha": "2025-10-08T20:00:00Z",
      "accion": "cerrar_turno",
      "detalles": "Corte #CORTE-145",
      "exitoso": true
    }
  ]
}
```

### GET /usuarios/:id/rendimiento

Obtener métricas de rendimiento.

**Roles**: Administrador, Gerente

**Response**:

```json
{
  "periodo": "mes_actual",
  "metricas": {
    "ordenes_procesadas": 245,
    "ticket_promedio": 156.8,
    "total_vendido": 38416.0,
    "tiempo_promedio_atencion": "8.5 minutos",
    "satisfaccion_cliente": 4.7,
    "errores_cometidos": 3
  },
  "comparativa": {
    "vs_mes_anterior": "+12%",
    "vs_promedio_equipo": "+8%",
    "ranking": "2 de 8"
  }
}
```

### POST /usuarios/:id/desbloquear

Desbloquear usuario bloqueado por intentos fallidos.

**Roles**: Administrador

## Servicios Principales

### create(dto: CreateUsuarioDto)

Crea nuevo usuario.

**Proceso**:

1. Validar email único
2. Validar fortaleza de password
3. Hashear password con bcrypt (10 rounds)
4. Crear usuario
5. Registrar en log de auditoría

```typescript
async create(dto: CreateUsuarioDto) {
  // Verificar email único
  const existe = await this.prisma.usuarios.findUnique({
    where: { email: dto.email }
  });

  if (existe) {
    throw new ConflictException('Email ya registrado');
  }

  // Hashear password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

  // Crear usuario
  return this.prisma.usuarios.create({
    data: {
      ...dto,
      password: hashedPassword,
      activo: true
    },
    select: {
      password: false, // No retornar password
      ...otrosCampos
    }
  });
}
```

### update(id: number, dto: UpdateUsuarioDto)

Actualiza usuario existente.

**Validaciones**:

- Usuario existe
- No puede desactivarse a sí mismo
- Solo Admin puede cambiar roles

### cambiarPassword(id: number, dto: CambiarPasswordDto, currentUserId: number)

Cambia la contraseña de un usuario.

**Validaciones**:

- Si es el mismo usuario, validar password actual
- Nueva password cumple requisitos
- Nueva password != password actual

```typescript
async cambiarPassword(id: number, dto: CambiarPasswordDto, currentUserId: number) {
  const usuario = await this.findOne(id);

  // Si el usuario está cambiando su propia password
  if (id === currentUserId) {
    const isValid = await bcrypt.compare(
      dto.password_actual,
      usuario.password
    );

    if (!isValid) {
      throw new UnauthorizedException('Password actual incorrecta');
    }
  }

  // Validar que la nueva sea diferente
  const isSamePassword = await bcrypt.compare(
    dto.password_nueva,
    usuario.password
  );

  if (isSamePassword) {
    throw new BadRequestException(
      'La nueva password debe ser diferente'
    );
  }

  // Hashear y actualizar
  const hashedPassword = await bcrypt.hash(dto.password_nueva, 10);

  return this.prisma.usuarios.update({
    where: { id_usuario: id },
    data: {
      password: hashedPassword,
      intentos_fallidos: 0,
      bloqueado_hasta: null
    }
  });
}
```

### registrarAcceso(userId: number, ip: string, userAgent: string)

Registra login del usuario.

**Proceso**:

1. Actualizar `ultimo_acceso`
2. Resetear `intentos_fallidos`
3. Registrar en log de accesos

### registrarIntentoFallido(email: string)

Registra intento de login fallido.

**Proceso**:

1. Incrementar contador
2. Si >= 5 intentos, bloquear por 15 minutos
3. Notificar a admin si es cuenta sensible

```typescript
async registrarIntentoFallido(email: string) {
  const usuario = await this.prisma.usuarios.findUnique({
    where: { email }
  });

  if (!usuario) return;

  const intentos = usuario.intentos_fallidos + 1;

  // Bloquear después de 5 intentos
  if (intentos >= 5) {
    await this.prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        intentos_fallidos: intentos,
        bloqueado_hasta: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      }
    });

    // Notificar si es cuenta admin
    if (usuario.rol === 'Administrador') {
      await this.notificarBloqueoCuentaSensible(usuario);
    }
  } else {
    await this.prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: { intentos_fallidos: intentos }
    });
  }
}
```

### getEstadisticas(id: number)

Obtiene estadísticas de desempeño.

**Métricas**:

- Órdenes procesadas
- Total vendido
- Ticket promedio
- Tiempo promedio de atención
- Errores cometidos

## DTOs

### CreateUsuarioDto

```typescript
export class CreateUsuarioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, {
    message:
      'Password debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsEnum(['Administrador', 'Gerente', 'Cajero', 'Mesero'])
  rol: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-\d{4}$/, {
    message: 'Formato de teléfono inválido (XXX-XXXX)',
  })
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_contratacion?: string;
}
```

### CambiarPasswordDto

```typescript
export class CambiarPasswordDto {
  @IsOptional()
  @IsString()
  password_actual?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)
  password_nueva: string;

  @IsString()
  confirmar_password: string;

  @Validate(
    (dto: CambiarPasswordDto) => dto.password_nueva === dto.confirmar_password,
    { message: 'Las contraseñas no coinciden' },
  )
  validarConfirmacion?: boolean;
}
```

## Reglas de Negocio

### 1. Email Único

```typescript
const existe = await prisma.usuarios.findUnique({
  where: { email: dto.email },
});

if (existe) {
  throw new ConflictException('Email ya registrado');
}
```

### 2. Fortaleza de Password

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Opcionalmente: caracteres especiales

### 3. Bloqueo por Intentos Fallidos

- 5 intentos fallidos = bloqueo 15 minutos
- Solo admin puede desbloquear
- Notificación para cuentas sensibles

### 4. No Auto-Desactivación

```typescript
if (currentUserId === userId && !dto.activo) {
  throw new BadRequestException('No puedes desactivar tu propia cuenta');
}
```

### 5. Jerarquía de Roles

```typescript
const nivelesRol = {
  Administrador: 4,
  Gerente: 3,
  Cajero: 2,
  Mesero: 1,
};

// Solo roles superiores pueden modificar inferiores
if (nivelesRol[currentUserRol] <= nivelesRol[targetUserRol]) {
  throw new ForbiddenException('No autorizado');
}
```

## Seguridad

### Password Hashing

```typescript
import * as bcrypt from 'bcrypt';

// Hashear
const saltRounds = 10;
const hash = await bcrypt.hash(plainPassword, saltRounds);

// Verificar
const isMatch = await bcrypt.compare(plainPassword, hash);
```

### Tokens JWT

Ver documento: [flujo-autenticacion.md](../procesos/flujo-autenticacion.md)

### Auditoría

Todos los cambios críticos se registran:

- Creación de usuario
- Cambio de rol
- Cambio de password
- Desactivación
- Intentos de acceso

## Testing

```typescript
describe('UsuariosService', () => {
  it('debe hashear password al crear usuario', async () => {
    const dto = { ...createDto, password: 'Plain123!' };
    const usuario = await service.create(dto);

    expect(usuario.password).not.toBe('Plain123!');
    expect(usuario.password).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it('debe bloquear después de 5 intentos fallidos', async () => {
    for (let i = 0; i < 5; i++) {
      await service.registrarIntentoFallido(email);
    }

    const usuario = await service.findByEmail(email);
    expect(usuario.bloqueado_hasta).toBeDefined();
  });

  it('debe validar email único', async () => {
    await service.create(createDto);

    await expect(service.create(createDto)).rejects.toThrow(
      'Email ya registrado',
    );
  });
});
```

## Datos de Ejemplo (Seed)

```typescript
const usuarios = [
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@kantares.com',
    password: await bcrypt.hash('Admin123!', 10),
    rol: 'Administrador',
    activo: true,
  },
  {
    nombre: 'María',
    apellido: 'López',
    email: 'maria.lopez@kantares.com',
    password: await bcrypt.hash('Cajero123!', 10),
    rol: 'Cajero',
    activo: true,
  },
];
```

## Troubleshooting

**No puede iniciar sesión**: Verificar que cuenta esté activa y no bloqueada

**Password no se acepta**: Verificar requisitos mínimos de seguridad

**Usuario bloqueado**: Admin debe desbloquearlo o esperar 15 minutos

**No puede cambiar rol**: Solo Admin puede modificar roles
