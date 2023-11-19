import { Type, type Static } from '@sinclair/typebox';

export const deleteBookPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type DeleteBookPathParameters = Static<typeof deleteBookPathParametersSchema>;

export const deleteBookResponseNoContentBodySchema = Type.Null();

export type DeleteBookResponseNoContentBody = Static<typeof deleteBookResponseNoContentBodySchema>;
