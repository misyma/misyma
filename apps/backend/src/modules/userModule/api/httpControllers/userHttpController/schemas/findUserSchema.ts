import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserPathParamsDTOSchema = Type.Object({
  id: Type.String(),
});

export type FindUserPathParamsDTO = TypeExtends<
  Static<typeof findUserPathParamsDTOSchema>,
  contracts.FindUserPathParams
>;

export const findUserResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
});

export type FindUserResponseBodyDTO = TypeExtends<
  Static<typeof findUserResponseBodyDTOSchema>,
  contracts.FindUserResponseBody
>;
