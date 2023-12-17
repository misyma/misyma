import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const loginUserBodyDTOSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export type LoginUserBodyDTO = TypeExtends<Static<typeof loginUserBodyDTOSchema>, contracts.LoginUserBody>;

export const loginUserResponseBodyDTOSchema = Type.Object({
  token: Type.String(),
});

export type LoginUserResponseBodyDTO = TypeExtends<
  Static<typeof loginUserResponseBodyDTOSchema>,
  contracts.LoginUserResponseBody
>;
