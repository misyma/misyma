import {
  bookFormats,
  type CreateBookChangeRequestRequestBody,
  type CreateBookChangeRequestResponseBody,
  languages,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';
import {
  bookTitleSchema,
  bookIsbnSchema,
  bookPublisherSchema,
  bookReleaseYearSchema,
  bookTranslatorSchema,
  bookPagesSchema,
  bookImageUrlSchema,
} from '../../common/bookDto.js';

export const createBookChangeRequestBodyDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
  title: Type.Optional(bookTitleSchema),
  isbn: Type.Optional(Type.Union([bookIsbnSchema, Type.Null()])),
  publisher: Type.Optional(Type.Union([bookPublisherSchema, Type.Null()])),
  releaseYear: Type.Optional(Type.Union([bookReleaseYearSchema, Type.Null()])),
  language: Type.Optional(Type.Union(Object.values(languages).map((language) => Type.Literal(language)))),
  translator: Type.Optional(Type.Union([bookTranslatorSchema, Type.Null()])),
  format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
  pages: Type.Optional(Type.Union([bookPagesSchema, Type.Null()])),
  imageUrl: Type.Optional(Type.Union([bookImageUrlSchema, Type.Null()])),
  authorIds: Type.Optional(
    Type.Array(
      Type.String({
        format: 'uuid',
      }),
      { minItems: 1 },
    ),
  ),
});

export type CreateBookChangeRequestBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestBodyDtoSchema>,
  CreateBookChangeRequestRequestBody
>;

export const createBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type CreateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestResponseBodyDtoSchema>,
  CreateBookChangeRequestResponseBody
>;
