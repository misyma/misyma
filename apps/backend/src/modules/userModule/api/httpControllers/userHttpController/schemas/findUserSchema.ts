import { type Static, Type } from '@sinclair/typebox';

import { userSchema } from './userSchema.js';

export const findUserPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type FindUserPathParameters = Static<typeof findUserPathParametersSchema>;

export const findUserResponseOkBodySchema = Type.Object({
  user: userSchema,
});

export type FindUserResponseOkBody = Static<typeof findUserResponseOkBodySchema>;
