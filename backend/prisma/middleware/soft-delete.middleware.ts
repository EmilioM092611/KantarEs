/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/prisma/middleware/soft-delete.middleware.ts

export function softDeleteMiddleware() {
  return async (params, next) => {
    // Modificar findMany, findFirst, findUnique
    if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
      if (!params.args?.where?.deleted_at) {
        params.args = {
          ...params.args,
          where: {
            ...params.args?.where,
            deleted_at: null,
          },
        };
      }
    }

    // Convertir delete en update
    if (params.action === 'delete') {
      params.action = 'update';
      params.args['data'] = { deleted_at: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args['data'] = { deleted_at: new Date() };
    }

    return next(params);
  };
}
