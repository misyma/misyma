import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const changeUserPasswordBodyDTOSchema = Type.Object({
  password: Type.String(),
  repeatedPassword: Type.String(),
  token: Type.String({
    description: 'PasswordResetToken',
  }),
});

export type ChangeUserPasswordBodyDTO = TypeExtends<
  Static<typeof changeUserPasswordBodyDTOSchema>,
  contracts.ChangeUserPasswordBody
>;

export const changeUserPasswordResponseBodyDTOSchema = Type.Null();

export type ChangeUserPasswordResponseBodyDTO = Static<typeof changeUserPasswordResponseBodyDTOSchema>;
