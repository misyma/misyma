import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findAuthorPathParamsDTOSchema = Type.Object({
  id: Type.String(),
});

export type FindAuthorPathParamsDTO = TypeExtends<
  Static<typeof findAuthorPathParamsDTOSchema>,
  contracts.FindAuthorPathParams
>;

export const findAuthorResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type FindAuthorResponseBodyDTO = TypeExtends<
  Static<typeof findAuthorResponseBodyDTOSchema>,
  contracts.FindAuthorResponseBody
>;
