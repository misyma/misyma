import { type CreateQuoteRequestBody, type CreateQuoteResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { quoteContentSchema, quoteDtoSchema, quotePageSchema } from './quoteDto.js';

export const createQuoteBodyDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
  content: Type.String(quoteContentSchema),
  isFavorite: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  page: Type.Optional(quotePageSchema),
});

export type CreateQuoteBodyDto = TypeExtends<Static<typeof createQuoteBodyDtoSchema>, CreateQuoteRequestBody>;

export const createQuoteResponseBodyDtoSchema = quoteDtoSchema;

export type CreateQuoteResponseBodyDto = TypeExtends<
  Static<typeof createQuoteResponseBodyDtoSchema>,
  CreateQuoteResponseBody
>;
