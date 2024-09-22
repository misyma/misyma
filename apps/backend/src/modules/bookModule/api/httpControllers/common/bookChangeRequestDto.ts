import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { authorDtoSchema } from './authorDto.js';
import {
  bookTitleSchema,
  bookIsbnSchema,
  bookPublisherSchema,
  bookReleaseYearSchema,
  bookTranslatorSchema,
  bookPagesSchema,
  bookImageUrlSchema,
} from './bookDto.js';

export const bookChangeRequestDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
  book: Type.Object({
    title: bookTitleSchema,
    isbn: Type.Optional(bookIsbnSchema),
    publisher: Type.Optional(bookPublisherSchema),
    releaseYear: Type.Optional(bookReleaseYearSchema),
    language: Type.Enum(contracts.Language),
    translator: Type.Optional(bookTranslatorSchema),
    format: Type.Enum(contracts.BookFormat),
    pages: Type.Optional(bookPagesSchema),
    isApproved: Type.Boolean(),
    imageUrl: Type.Optional(bookImageUrlSchema),
    createdAt: Type.String({ format: 'date-time' }),
    authors: Type.Array(authorDtoSchema),
  }),
  userEmail: Type.String({ format: 'email' }),
  createdAt: Type.String({ format: 'date-time' }),
  title: Type.Optional(bookTitleSchema),
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: Type.Optional(bookReleaseYearSchema),
  language: Type.Optional(Type.Enum(contracts.Language)),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Enum(contracts.BookFormat)),
  pages: Type.Optional(bookPagesSchema),
  imageUrl: Type.Optional(bookImageUrlSchema),
  authorIds: Type.Optional(
    Type.Array(
      Type.String({
        format: 'uuid',
      }),
      { minItems: 1 },
    ),
  ),
});

export type BookChangeRequestDto = Static<typeof bookChangeRequestDtoSchema>;
