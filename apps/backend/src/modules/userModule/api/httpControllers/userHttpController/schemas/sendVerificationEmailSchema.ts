import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const sendVerificationEmailBodyDtoSchema = Type.Object({
  email: Type.String({
    format: 'email',
    maxLength: 254,
  }),
});

export type SendVerificationEmailBodyDto = TypeExtends<
  Static<typeof sendVerificationEmailBodyDtoSchema>,
  contracts.SendVerificationEmailRequestBody
>;

export const sendVerificationEmailResponseBodyDtoSchema = Type.Null();

export type SendVerificationEmailResponseBodyDto = Static<typeof sendVerificationEmailResponseBodyDtoSchema>;
