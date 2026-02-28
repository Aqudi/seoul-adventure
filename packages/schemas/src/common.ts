import { Type, Static } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  error: Type.String(),
});
export type ErrorResponse = Static<typeof ErrorSchema>;

export const IdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export const PaginationQuerySchema = Type.Object({
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
  offset: Type.Optional(Type.Number({ minimum: 0 })),
});
