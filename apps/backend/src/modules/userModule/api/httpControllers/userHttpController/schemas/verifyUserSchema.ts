import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const verifyUserBodyDtoSchema = Type.Object({
  token: Type.String({ minLength: 1 }),
});

export type VerifyUserBodyDto = TypeExtends<Static<typeof verifyUserBodyDtoSchema>, contracts.VerifyUserRequestBody>;

export const verifyUserResponseBodyDtoSchema = Type.Null();

export type VerifyUserResponseBodyDto = Static<typeof verifyUserResponseBodyDtoSchema>;
