import { Type, type Static } from '@sinclair/typebox';

export const deleteAuthorPathParamsSchema = Type.Object({
  id: Type.String(),
});

export type DeleteAuthorPathParams = Static<typeof deleteAuthorPathParamsSchema>;

export const deleteAuthorResponseNoContentBodySchema = Type.Null();

export type DeleteAuthorResponseNoContentBody = Static<typeof deleteAuthorResponseNoContentBodySchema>;
