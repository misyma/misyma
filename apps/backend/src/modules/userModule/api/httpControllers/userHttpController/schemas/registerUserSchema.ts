import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const registerUserBodyDTOSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type RegisterUserBodyDTO = TypeExtends<Static<typeof registerUserBodyDTOSchema>, contracts.LoginUserBody>;

export const registerUserResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  isEmailVerified: Type.Boolean(),
});

export type RegisterUserResponseBodyDTO = TypeExtends<
  Static<typeof registerUserResponseBodyDTOSchema>,
  contracts.RegisterUserResponseBody
>;
