import { Type, type Static } from '@sinclair/typebox';

export const deleteUserPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type DeleteUserPathParameters = Static<typeof deleteUserPathParametersSchema>;

export const deleteUserResponseNoContentBodySchema = Type.Null();

export type DeleteUserResponseNoContentBody = Static<typeof deleteUserResponseNoContentBodySchema>;
