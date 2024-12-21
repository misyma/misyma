/* eslint-disable @typescript-eslint/naming-convention */

import { type Static, Type } from '@sinclair/typebox';
import { type FastifyRequest } from 'fastify';

import type * as contracts from '@common/contracts';

import { InputNotValidError } from '../../../../../../common/errors/inputNotValidError.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { emailSchema, passwordSchema, userDtoSchema, userNameSchema } from '../../common/userDto.js';

export const registerUserRequestBodyDtoSchema = Type.Object({
  email: emailSchema,
  password: passwordSchema,
  name: userNameSchema,
});

export type RegisterUserRequestBodyDto = TypeExtends<
  Static<typeof registerUserRequestBodyDtoSchema>,
  contracts.RegisterUserRequestBody
>;

export const registerUserResponseBodyDtoSchema = userDtoSchema;

export type RegisterUserResponseBodyDto = TypeExtends<
  Static<typeof registerUserResponseBodyDtoSchema>,
  contracts.RegisterUserResponseBody
>;

export const registerUserBodyPreValidationHook = (
  request: FastifyRequest<{ Body: RegisterUserRequestBodyDto }>,
): void => {
  const { name } = request.body;

  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/g;

  if (specialCharacterRegex.test(name)) {
    throw new InputNotValidError({
      reason: 'body/name must NOT contain special characters',
      value: name,
    });
  }
};
