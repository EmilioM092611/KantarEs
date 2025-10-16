// backend/src/common/decorators/api-standard-responses.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { StandardResponseDto } from '../dto/standard-response.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';

export const ApiStandardResponses = <TModel extends Type<any>>(
  model: TModel,
  options?: {
    isArray?: boolean;
    isPaginated?: boolean;
  },
) => {
  const decorators = [
    ApiExtraModels(StandardResponseDto, ErrorResponseDto, model),
    ApiResponse({
      status: 200,
      description: 'Operación exitosa',
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              data: options?.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Solicitud inválida',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'No autenticado',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'No autorizado',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Recurso no encontrado',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      type: ErrorResponseDto,
    }),
  ];

  if (options?.isPaginated) {
    decorators.push(
      ApiExtraModels(PaginatedResponseDto),
      ApiResponse({
        status: 200,
        description: 'Listado paginado',
        schema: {
          allOf: [
            { $ref: getSchemaPath(PaginatedResponseDto) },
            {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                },
              },
            },
          ],
        },
      }),
    );
  }

  return applyDecorators(...decorators);
};
