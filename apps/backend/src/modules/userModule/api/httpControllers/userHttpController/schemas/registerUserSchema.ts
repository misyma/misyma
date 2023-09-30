import { type Static, Type } from '@sinclair/typebox';

import { userSchema } from './userSchema.js';

export const registerUserBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export type RegisterUserBody = Static<typeof registerUserBodySchema>;

export const registerUserResponseCreatedBodySchema = Type.Object({
  user: userSchema,
});

export type RegisterUserResponseCreatedBody = Static<typeof registerUserResponseCreatedBodySchema>;
