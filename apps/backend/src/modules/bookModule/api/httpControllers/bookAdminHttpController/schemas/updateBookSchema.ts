import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

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

export const updateBookPathParamsDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookPathParamsDto = TypeExtends<
  Static<typeof updateBookPathParamsDtoSchema>,
  contracts.UpdateBookPathParams
>;

export const updateBookBodyDtoSchema = Type.Object({
  title: Type.Optional(bookTitleSchema),
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: Type.Optional(bookReleaseYearSchema),
  language: Type.Optional(Type.Enum(contracts.Language)),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Enum(contracts.BookFormat)),
  pages: Type.Optional(bookPagesSchema),
  imageUrl: Type.Optional(bookImageUrlSchema),
  isApproved: Type.Optional(Type.Boolean()),
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type UpdateBookBodyDto = TypeExtends<Static<typeof updateBookBodyDtoSchema>, contracts.UpdateBookRequestBody>;

export const updateBookResponseBodyDtoSchema = bookDtoSchema;

export type UpdateBookResponseBodyDto = TypeExtends<
  Static<typeof updateBookResponseBodyDtoSchema>,
  contracts.UpdateBookResponseBody
>;
