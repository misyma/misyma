import { type SendVerificationEmailRequestBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { emailSchema } from '../../common/userDto.js';

export const sendVerificationEmailBodyDtoSchema = Type.Object({ email: emailSchema });

export type SendVerificationEmailBodyDto = TypeExtends<
  Static<typeof sendVerificationEmailBodyDtoSchema>,
  SendVerificationEmailRequestBody
>;

export const sendVerificationEmailResponseBodyDtoSchema = Type.Null();

export type SendVerificationEmailResponseBodyDto = Static<typeof sendVerificationEmailResponseBodyDtoSchema>;
