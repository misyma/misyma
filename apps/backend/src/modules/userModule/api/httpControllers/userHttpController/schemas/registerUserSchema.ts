import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userDTOSchema } from './userDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const registerUserBodyDTOSchema = Type.Object({
  email: Type.String({
    format: 'email',
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 64,
  }),
  name: Type.String(),
});

export type RegisterUserBodyDTO = TypeExtends<Static<typeof registerUserBodyDTOSchema>, contracts.LoginUserRequestBody>;

export const registerUserResponseBodyDTOSchema = userDTOSchema;

export type RegisterUserResponseBodyDTO = TypeExtends<
  Static<typeof registerUserResponseBodyDTOSchema>,
  contracts.RegisterUserResponseBody
>;
