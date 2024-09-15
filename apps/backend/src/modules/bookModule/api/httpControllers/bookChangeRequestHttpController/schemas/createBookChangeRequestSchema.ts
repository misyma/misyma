import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

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

export type CreateBookChangeRequestBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestBodyDtoSchema>,
  contracts.CreateBookChangeRequestRequestBody
>;

export const createBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type CreateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestResponseBodyDtoSchema>,
  contracts.CreateBookChangeRequestResponseBody
>;
