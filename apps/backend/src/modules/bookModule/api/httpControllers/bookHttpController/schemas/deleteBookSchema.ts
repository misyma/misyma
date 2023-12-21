import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookPathParamsDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
});

export type DeleteBookPathParamsDTO = TypeExtends<
  Static<typeof deleteBookPathParamsDTOSchema>,
  contracts.DeleteBookPathParams
>;

export const deleteBookResponseBodyDTOSchema = Type.Null();

export type DeleteBookResponseBodyDTO = Static<typeof deleteBookResponseBodyDTOSchema>;
