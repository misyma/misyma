import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDtoSchema, userNameSchema } from '../../common/userDto.js';

export const updateUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type UpdateUserPathParamsDto = TypeExtends<
  Static<typeof updateUserPathParamsDtoSchema>,
  contracts.UpdateUserPathParams
>;

export const updateUserRequestBodyDtoSchema = Type.Object({
  name: userNameSchema,
});

export type UpdateUserRequestBodyDto = TypeExtends<
  Static<typeof updateUserRequestBodyDtoSchema>,
  contracts.UpdateUserRequestBody
>;

export const updateUserResponseBodyDtoSchema = userDtoSchema;

export type UpdateUserResponseBodyDto = TypeExtends<
  Static<typeof updateUserResponseBodyDtoSchema>,
  contracts.UpdateUserResponseBody
>;
