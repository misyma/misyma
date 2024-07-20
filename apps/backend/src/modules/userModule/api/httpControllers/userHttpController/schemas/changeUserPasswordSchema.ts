import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const changeUserPasswordBodyDtoSchema = Type.Object({
  password: Type.String({
    minLength: 8,
    maxLength: 64,
  }),
  token: Type.Optional(Type.String({ minLength: 1 })),
});

export type ChangeUserPasswordBodyDto = TypeExtends<
  Static<typeof changeUserPasswordBodyDtoSchema>,
  contracts.ChangeUserPasswordRequestBody
>;

export const changeUserPasswordResponseBodyDtoSchema = Type.Null();

export type ChangeUserPasswordResponseBodyDto = Static<typeof changeUserPasswordResponseBodyDtoSchema>;
