import { languages, bookFormats, type CreateBookRequestBody, type CreateBookResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import {
  bookDtoSchema,
  bookImageUrlSchema,
  bookIsbnSchema,
  bookPagesSchema,
  bookPublisherSchema,
  bookReleaseYearSchema,
  bookTitleSchema,
  bookTranslatorSchema,
} from '../../common/bookDto.js';

export const createBookBodyDtoSchema = Type.Object({
  title: bookTitleSchema,
  genreId: Type.String({ format: 'uuid' }),
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: bookReleaseYearSchema,
  language: Type.Union(Object.values(languages).map((language) => Type.Literal(language))),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
  pages: Type.Optional(bookPagesSchema),
  isApproved: Type.Boolean(),
  imageUrl: Type.Optional(bookImageUrlSchema),
  authorIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type CreateBookBodyDto = TypeExtends<Static<typeof createBookBodyDtoSchema>, CreateBookRequestBody>;

export const createBookResponseBodyDtoSchema = bookDtoSchema;

export type CreateBookResponseBodyDto = TypeExtends<
  Static<typeof createBookResponseBodyDtoSchema>,
  CreateBookResponseBody
>;
