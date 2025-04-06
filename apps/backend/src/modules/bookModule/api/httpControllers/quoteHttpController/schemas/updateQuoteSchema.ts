import {
  type UpdateQuotePathParams,
  type UpdateQuoteRequestBody,
  type UpdateQuoteResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { quoteContentSchema, quoteDtoSchema, quotePageSchema } from './quoteDto.js';

export const updateQuotePathParamsDtoSchema = Type.Object({
  quoteId: Type.String({ format: 'uuid' }),
});

export type UpdateQuotePathParamsDto = TypeExtends<
  Static<typeof updateQuotePathParamsDtoSchema>,
  UpdateQuotePathParams
>;

export const updateQuoteBodyDtoSchema = Type.Object({
  content: Type.Optional(quoteContentSchema),
  isFavorite: Type.Optional(Type.Boolean()),
  page: Type.Optional(quotePageSchema),
});

export type UpdateQuoteBodyDto = TypeExtends<Static<typeof updateQuoteBodyDtoSchema>, UpdateQuoteRequestBody>;

export const updateQuoteResponseBodyDtoSchema = quoteDtoSchema;

export type UpdateQuoteResponseBodyDto = TypeExtends<
  Static<typeof updateQuoteResponseBodyDtoSchema>,
  UpdateQuoteResponseBody
>;
