import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { bookReadingDtoSchema } from '../../bookReadingHttpController/schemas/bookReadingDto.js';
import { authorDtoSchema } from '../../common/authorDto.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const userBookDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  status: Type.Enum(contracts.ReadingStatus),
  isFavorite: Type.Boolean(),
  bookshelfId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  genres: Type.Array(genreDtoSchema),
  collections: Type.Array(collectionDtoSchema),
  readings: Type.Array(bookReadingDtoSchema),
  bookId: Type.String({ format: 'uuid' }),
  book: Type.Object({
    title: Type.String({
      minLength: 1,
      maxLength: 64,
    }),
    isbn: Type.Optional(
      Type.String({
        pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
      }),
    ),
    publisher: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    releaseYear: Type.Optional(
      Type.Integer({
        minimum: 1500,
        maximum: 2500,
      }),
    ),
    language: Type.Enum(contracts.Language),
    translator: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    format: Type.Enum(contracts.BookFormat),
    pages: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 10000,
      }),
    ),
    isApproved: Type.Boolean(),
    imageUrl: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 128,
      }),
    ),
    authors: Type.Array(authorDtoSchema),
  }),
});

export type UserBookDto = Static<typeof userBookDtoSchema>;
