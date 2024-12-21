import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { passwordSchema } from '../../common/userDto.js';

export const changeUserPasswordBodyDtoSchema = Type.Object({
  password: passwordSchema,
  token: Type.Optional(Type.String({ minLength: 1 })),
});

export type ChangeUserPasswordBodyDto = TypeExtends<
  Static<typeof changeUserPasswordBodyDtoSchema>,
  contracts.ChangeUserPasswordRequestBody
>;

export const changeUserPasswordResponseBodyDtoSchema = Type.Null();

export type ChangeUserPasswordResponseBodyDto = Static<typeof changeUserPasswordResponseBodyDtoSchema>;
