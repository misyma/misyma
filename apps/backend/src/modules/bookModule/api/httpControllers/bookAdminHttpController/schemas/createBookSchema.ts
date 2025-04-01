import * as contracts from '@common/contracts';
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
  genreId: Type.String({ format: "uuid"}),
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: bookReleaseYearSchema,
  language: Type.Enum(contracts.Language),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Enum(contracts.BookFormat),
  pages: Type.Optional(bookPagesSchema),
  isApproved: Type.Boolean(),
  imageUrl: Type.Optional(bookImageUrlSchema),
  authorIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type CreateBookBodyDto = TypeExtends<Static<typeof createBookBodyDtoSchema>, contracts.CreateBookRequestBody>;

export const createBookResponseBodyDtoSchema = bookDtoSchema;

export type CreateBookResponseBodyDto = TypeExtends<
  Static<typeof createBookResponseBodyDtoSchema>,
  contracts.CreateBookResponseBody
>;
