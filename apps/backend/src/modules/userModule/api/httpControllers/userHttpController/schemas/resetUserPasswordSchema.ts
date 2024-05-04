import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const resetUserPasswordBodyDtoSchema = Type.Object({
  email: Type.String({
    format: 'email',
    maxLength: 254,
  }),
});

export type ResetUserPasswordBodyDto = TypeExtends<
  Static<typeof resetUserPasswordBodyDtoSchema>,
  contracts.ResetUserPasswordRequestBody
>;

export const resetUserPasswordResponseBodyDtoSchema = Type.Null();

export type ResetUserPasswordResponseBodyDto = Static<typeof resetUserPasswordResponseBodyDtoSchema>;
