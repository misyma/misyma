import { ReadingStatus, languages, bookFormats } from '@common/contracts';
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
  status: Type.Enum(ReadingStatus),
  isFavorite: Type.Boolean(),
  bookshelfId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  collections: Type.Array(collectionDtoSchema),
  readings: Type.Array(bookReadingDtoSchema),
  bookId: Type.String({ format: 'uuid' }),
  book: Type.Object({
    title: bookTitleSchema,
    genreId: Type.String({ format: 'uuid' }),
    genreName: Type.Optional(Type.String()),
    isbn: Type.Optional(bookIsbnSchema),
    publisher: Type.Optional(bookPublisherSchema),
    releaseYear: bookReleaseYearSchema,
    language: Type.Union(Object.values(languages).map((language) => Type.Literal(language))),
    translator: Type.Optional(bookTranslatorSchema),
    format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
    pages: Type.Optional(bookPagesSchema),
    isApproved: Type.Boolean(),
    imageUrl: Type.Optional(bookImageUrlSchema),
    createdAt: Type.String({ format: 'date-time' }),
    authors: Type.Array(authorDtoSchema),
  }),
  latestRating: Type.Optional(Type.Number()),
});

export type UserBookDto = Static<typeof userBookDtoSchema>;
