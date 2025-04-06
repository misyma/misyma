import { type UpdateUserPathParams, type UpdateUserRequestBody, type UpdateUserResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDtoSchema, userNameSchema } from '../../common/userDto.js';

export const updateUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type UpdateUserPathParamsDto = TypeExtends<Static<typeof updateUserPathParamsDtoSchema>, UpdateUserPathParams>;

export const updateUserRequestBodyDtoSchema = Type.Object({
  name: userNameSchema,
});

export type UpdateUserRequestBodyDto = TypeExtends<
  Static<typeof updateUserRequestBodyDtoSchema>,
  UpdateUserRequestBody
>;

export const updateUserResponseBodyDtoSchema = userDtoSchema;

export type UpdateUserResponseBodyDto = TypeExtends<
  Static<typeof updateUserResponseBodyDtoSchema>,
  UpdateUserResponseBody
>;
