import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { quoteContentSchema, quoteDtoSchema, quotePageSchema } from './quoteDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createQuotePathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateQuotePathParamsDto = TypeExtends<
  Static<typeof createQuotePathParamsDtoSchema>,
  contracts.CreateQuotePathParams
>;

export const createQuoteBodyDtoSchema = Type.Object({
  content: Type.String(quoteContentSchema),
  isFavorite: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  page: Type.Optional(quotePageSchema),
});

export type CreateQuoteBodyDto = TypeExtends<Static<typeof createQuoteBodyDtoSchema>, contracts.CreateQuoteRequestBody>;

export const createQuoteResponseBodyDtoSchema = quoteDtoSchema;

export type CreateQuoteResponseBodyDto = TypeExtends<
  Static<typeof createQuoteResponseBodyDtoSchema>,
  contracts.CreateQuoteResponseBody
>;
