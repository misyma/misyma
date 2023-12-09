import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userSchema } from './userSchema.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const registerUserBodyDTOSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export type RegisterUserBodyDTO = TypeExtends<Static<typeof registerUserBodyDTOSchema>, contracts.LoginUserBody>;

export const registerUserResponseBodyDTOSchema = Type.Object({
  user: userSchema,
});

export type RegisterUserResponseBodyDTO = TypeExtends<
  Static<typeof registerUserResponseBodyDTOSchema>,
  contracts.RegisterUserResponseBody
>;
