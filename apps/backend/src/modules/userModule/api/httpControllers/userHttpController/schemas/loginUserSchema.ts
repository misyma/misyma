import { type LoginUserRequestBody, type LoginUserResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { emailSchema, passwordSchema } from '../../common/userDto.js';

export const loginUserBodyDtoSchema = Type.Object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginUserBodyDto = TypeExtends<Static<typeof loginUserBodyDtoSchema>, LoginUserRequestBody>;

export const loginUserResponseBodyDtoSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type LoginUserResponseBodyDto = TypeExtends<
  Static<typeof loginUserResponseBodyDtoSchema>,
  LoginUserResponseBody
>;
