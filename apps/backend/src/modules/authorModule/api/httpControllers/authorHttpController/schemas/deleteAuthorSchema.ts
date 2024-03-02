import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteAuthorPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type DeleteAuthorPathParamsDTO = TypeExtends<
  Static<typeof deleteAuthorPathParamsDTOSchema>,
  contracts.DeleteAuthorPathParams
>;

export const deleteAuthorResponseBodyDTOSchema = Type.Null();

export type DeleteAuthorResponseBodyDTO = Static<typeof deleteAuthorResponseBodyDTOSchema>;
