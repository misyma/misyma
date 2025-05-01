import { languages, bookFormats, readingStatuses } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { bookReadingDtoSchema } from '../../bookReadingHttpController/schemas/bookReadingDto.js';
import { authorDtoSchema } from '../../common/authorDto.js';
import {
  bookImageUrlSchema,
  bookIsbnSchema,
  bookPagesSchema,
  bookPublisherSchema,
  bookReleaseYearSchema,
  bookTitleSchema,
  bookTranslatorSchema,
} from '../../common/bookDto.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';

export const userBookDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  imageUrl: Type.Optional(bookImageUrlSchema),
  status: Type.Union(Object.values(readingStatuses).map((status) => Type.Literal(status))),
  isFavorite: Type.Boolean(),
  bookshelfId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  collections: Type.Array(collectionDtoSchema),
  readings: Type.Array(bookReadingDtoSchema),
  bookId: Type.String({ format: 'uuid' }),
  book: Type.Object({
    title: bookTitleSchema,
    categoryId: Type.String({ format: 'uuid' }),
    categoryName: Type.Optional(Type.String()),
    isbn: Type.Optional(bookIsbnSchema),
    publisher: Type.Optional(bookPublisherSchema),
    releaseYear: bookReleaseYearSchema,
    language: Type.Union(Object.values(languages).map((language) => Type.Literal(language))),
    translator: Type.Optional(bookTranslatorSchema),
    format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
    pages: Type.Optional(bookPagesSchema),
    isApproved: Type.Boolean(),
    imageUrl: Type.Optional(bookImageUrlSchema),
    authors: Type.Array(authorDtoSchema),
  }),
  latestRating: Type.Optional(Type.Number()),
});

export type UserBookDto = Static<typeof userBookDtoSchema>;
