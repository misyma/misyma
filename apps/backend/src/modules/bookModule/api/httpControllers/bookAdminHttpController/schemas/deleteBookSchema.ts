import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type DeleteBookPathParamsDto = TypeExtends<
  Static<typeof deleteBookPathParamsDtoSchema>,
  contracts.DeleteBookPathParams
>;

export const deleteBookResponseBodyDtoSchema = Type.Null();

export type DeleteBookResponseBodyDto = Static<typeof deleteBookResponseBodyDtoSchema>;
