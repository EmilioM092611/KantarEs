// backend/prisma/seeds/seed-configuracion.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedConfiguracion() {
  console.log('⚙️  Seeding configuración del sistema...');

  // Limpiar configuraciones existentes
  await prisma.configuracion_sistema.deleteMany({});

  const configuraciones = [
    {
      clave: 'general',
      seccion: 'informacion',
      descripcion: 'Información general del restaurante',
      valor: {
        nombre_restaurante: 'KANTARES',
        direccion: 'Av. Revolución 123, Col. Centro, CDMX',
        telefono: '+52 55 1234 5678',
        email: 'info@kantares.com',
        rfc: 'XXX000000XXX',
        logo_url: '',
        slogan: 'Sabor que enamora',
        sitio_web: 'https://www.kantares.com',
        redes_sociales: {
          facebook: '',
          instagram: '',
          twitter: '',
          tiktok: '',
        },
      },
    },
    {
      clave: 'operativa',
      seccion: 'operacion',
      descripcion: 'Configuración operativa del restaurante',
      valor: {
        horarios: {
          lunes: { apertura: '09:00', cierre: '22:00', cerrado: false },
          martes: { apertura: '09:00', cierre: '22:00', cerrado: false },
          miercoles: { apertura: '09:00', cierre: '22:00', cerrado: false },
          jueves: { apertura: '09:00', cierre: '22:00', cerrado: false },
          viernes: { apertura: '09:00', cierre: '23:00', cerrado: false },
          sabado: { apertura: '10:00', cierre: '23:00', cerrado: false },
          domingo: { apertura: '10:00', cierre: '21:00', cerrado: false },
        },
        tiempo_espera_estimado: 30,
        capacidad_maxima_personas: 100,
        permite_reservaciones: true,
        tiempo_anticipacion_reservaciones: 7,
        duracion_promedio_comida: 90,
        alerta_tiempo_mesa_sin_atencion: 15,
        tiempo_gracia_reservacion: 15,
      },
    },
    {
      clave: 'fiscal',
      seccion: 'impuestos',
      descripcion: 'Configuración fiscal y de impuestos',
      valor: {
        iva_tasa_default: 16,
        ieps_aplicable: false,
        ieps_tasa_default: 8,
        propina_sugerida_porcentaje: [10, 15, 20],
        propina_obligatoria: false,
        propina_tasa_obligatoria: 0,
        regimen_fiscal: '601 - General de Ley Personas Morales',
        lugar_expedicion: '06000',
        incluir_propina_en_factura: false,
      },
    },
    {
      clave: 'folios',
      seccion: 'numeracion',
      descripcion: 'Configuración de folios y numeración',
      valor: {
        prefijo_orden: 'ORD',
        prefijo_pago: 'PAY',
        prefijo_corte: 'CORTE',
        prefijo_compra: 'COMP',
        prefijo_factura: 'FACT',
        longitud_consecutivo: 6,
        reiniciar_diario: false,
        reiniciar_mensual: false,
        reiniciar_anual: true,
      },
    },
    {
      clave: 'alertas',
      seccion: 'notificaciones',
      descripcion: 'Configuración de alertas y notificaciones',
      valor: {
        inventario: {
          dias_antes_agotamiento: 3,
          porcentaje_stock_minimo_alerta: 20,
          notificar_productos_proximos_vencer: true,
          dias_antes_vencimiento: 7,
        },
        mesas: {
          minutos_sin_atencion: 10,
          porcentaje_ocupacion_alta: 80,
          notificar_mesa_disponible: true,
        },
        cocina: {
          minutos_tiempo_preparacion_excedido: 5,
          notificar_orden_lista: true,
          notificar_orden_retrasada: true,
        },
        reservaciones: {
          minutos_antes_notificar: 15,
          notificar_reservacion_proxima: true,
        },
      },
    },
    {
      clave: 'turnos',
      seccion: 'horarios',
      descripcion: 'Configuración de turnos de trabajo',
      valor: {
        turnos: [
          {
            nombre: 'Matutino',
            hora_inicio: '09:00',
            hora_fin: '15:00',
            dias_semana: [1, 2, 3, 4, 5, 6],
            requiere_corte: true,
            activo: true,
          },
          {
            nombre: 'Vespertino',
            hora_inicio: '15:00',
            hora_fin: '22:00',
            dias_semana: [1, 2, 3, 4, 5, 6],
            requiere_corte: true,
            activo: true,
          },
        ],
        permitir_traslape_turnos: false,
        requiere_corte_entre_turnos: true,
      },
    },
  ];

  for (const config of configuraciones) {
    await prisma.configuracion_sistema.create({
      data: config,
    });
    console.log(`   ✅ ${config.clave}`);
  }

  console.log('✅ Configuración del sistema seeded correctamente\n');
}
