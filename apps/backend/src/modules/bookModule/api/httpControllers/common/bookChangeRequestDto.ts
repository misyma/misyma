import { languages, bookFormats } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

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
  bookTitle: bookTitleSchema,
  userEmail: Type.String({ format: 'email' }),
  createdAt: Type.String({ format: 'date-time' }),
  title: Type.Optional(bookTitleSchema),
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: Type.Optional(bookReleaseYearSchema),
  language: Type.Optional(Type.Union(Object.values(languages).map((language) => Type.Literal(language)))),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
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
  changedFields: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
});

export type BookChangeRequestDto = Static<typeof bookChangeRequestDtoSchema>;
