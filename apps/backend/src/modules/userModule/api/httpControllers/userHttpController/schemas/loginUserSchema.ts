import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const loginUserBodyDtoSchema = Type.Object({
  email: Type.String({
    format: 'email',
    maxLength: 254,
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 64,
  }),
});

export type LoginUserBodyDto = TypeExtends<Static<typeof loginUserBodyDtoSchema>, contracts.LoginUserRequestBody>;

export const loginUserResponseBodyDtoSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type LoginUserResponseBodyDto = TypeExtends<
  Static<typeof loginUserResponseBodyDtoSchema>,
  contracts.LoginUserResponseBody
>;
