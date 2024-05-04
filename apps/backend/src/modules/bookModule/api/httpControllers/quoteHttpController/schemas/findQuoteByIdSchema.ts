import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { quoteDtoSchema } from './quoteDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findQuoteByIdPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindQuoteByIdPathParamsDto = TypeExtends<
  Static<typeof findQuoteByIdPathParamsDtoSchema>,
  contracts.FindQuoteByIdPathParams
>;

export const findQuoteByIdResponseBodyDtoSchema = quoteDtoSchema;

export type FindQuoteByIdResponseBodyDto = TypeExtends<
  Static<typeof findQuoteByIdResponseBodyDtoSchema>,
  contracts.FindQuoteByIdResponseBody
>;
