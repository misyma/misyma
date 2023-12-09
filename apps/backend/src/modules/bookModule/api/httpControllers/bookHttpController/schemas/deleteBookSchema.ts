import { Type, type Static } from '@sinclair/typebox';

export const deleteBookPathParamsSchema = Type.Object({
  id: Type.String(),
});

export type DeleteBookPathParams = Static<typeof deleteBookPathParamsSchema>;

export const deleteBookResponseNoContentBodySchema = Type.Null();

export type DeleteBookResponseNoContentBody = Static<typeof deleteBookResponseNoContentBodySchema>;
