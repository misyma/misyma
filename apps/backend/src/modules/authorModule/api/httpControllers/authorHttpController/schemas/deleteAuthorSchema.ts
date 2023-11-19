import { Type, type Static } from '@sinclair/typebox';

export const deleteAuthorPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type DeleteAuthorPathParameters = Static<typeof deleteAuthorPathParametersSchema>;

export const deleteAuthorResponseNoContentBodySchema = Type.Null();

export type DeleteAuthorResponseNoContentBody = Static<typeof deleteAuthorResponseNoContentBodySchema>;
