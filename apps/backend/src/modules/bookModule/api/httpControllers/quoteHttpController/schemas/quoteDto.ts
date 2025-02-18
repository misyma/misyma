import { type Static, Type } from '@sinclair/typebox';

import { authorNameSchema } from '../../common/authorDto.js';
import { bookTitleSchema } from '../../common/bookDto.js';

export const quoteContentSchema = Type.String({
  minLength: 1,
  maxLength: 1000,
});

export const quotePageSchema = Type.String({
  minLength: 1,
  maxLength: 16,
});

export const quoteDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
  content: quoteContentSchema,
  isFavorite: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  page: Type.Optional(quotePageSchema),
  bookTitle: Type.Optional(bookTitleSchema),
  authors: Type.Optional(Type.Array(authorNameSchema)),
});

export type QuoteDto = Static<typeof quoteDtoSchema>;
