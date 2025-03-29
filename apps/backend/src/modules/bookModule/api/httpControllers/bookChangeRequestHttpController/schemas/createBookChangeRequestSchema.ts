import * as contracts from '@common/contracts';
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
  language: Type.Optional(Type.Enum(contracts.Language)),
  translator: Type.Optional(Type.Union([bookTranslatorSchema, Type.Null()])),
  format: Type.Optional(Type.Enum(contracts.BookFormat)),
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
  contracts.CreateBookChangeRequestRequestBody
>;

export const createBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type CreateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestResponseBodyDtoSchema>,
  contracts.CreateBookChangeRequestResponseBody
>;
