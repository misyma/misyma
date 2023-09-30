import { Type, type Static } from '@sinclair/typebox';

export const responseErrorBodySchema = Type.Object({
  error: Type.Object({
    name: Type.String(),
    message: Type.String(),
    context: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }),
});

export type ResponseErrorBody = Static<typeof responseErrorBodySchema>;
