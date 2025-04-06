import { type FindUserPathParams, type FindUserResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDtoSchema } from '../../common/userDto.js';

export const findUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type FindUserPathParamsDto = TypeExtends<Static<typeof findUserPathParamsDtoSchema>, FindUserPathParams>;

export const findUserResponseBodyDtoSchema = userDtoSchema;

export type FindUserResponseBodyDto = TypeExtends<Static<typeof findUserResponseBodyDtoSchema>, FindUserResponseBody>;
