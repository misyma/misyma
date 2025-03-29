import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteQuotePathParamsDtoSchema = Type.Object({
  quoteId: Type.String({ format: 'uuid' }),
});

export type DeleteQuotePathParamsDto = TypeExtends<
  Static<typeof deleteQuotePathParamsDtoSchema>,
  contracts.DeleteQuotePathParams
>;

export const deleteQuoteResponseBodyDtoSchema = Type.Null();

export type DeleteQuoteResponseBodyDto = Static<typeof deleteQuoteResponseBodyDtoSchema>;
