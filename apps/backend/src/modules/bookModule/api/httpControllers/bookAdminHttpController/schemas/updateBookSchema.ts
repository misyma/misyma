import {
  type UpdateBookPathParams,
  languages,
  bookFormats,
  type UpdateBookRequestBody,
  type UpdateBookResponseBody,
} from '@common/contracts';
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

export const updateBookPathParamsDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookPathParamsDto = TypeExtends<Static<typeof updateBookPathParamsDtoSchema>, UpdateBookPathParams>;

export const updateBookBodyDtoSchema = Type.Object({
  title: Type.Optional(bookTitleSchema),
  isbn: Type.Optional(bookIsbnSchema),
  categoryId: Type.Optional(Type.String({ format: 'uuid' })),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: Type.Optional(bookReleaseYearSchema),
  language: Type.Optional(Type.Union(Object.values(languages).map((language) => Type.Literal(language)))),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Optional(Type.Union(Object.values(bookFormats).map((bookFormat) => Type.Literal(bookFormat)))),
  pages: Type.Optional(bookPagesSchema),
  imageUrl: Type.Optional(bookImageUrlSchema),
  isApproved: Type.Optional(Type.Boolean()),
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 })),
});

export type UpdateBookBodyDto = TypeExtends<Static<typeof updateBookBodyDtoSchema>, UpdateBookRequestBody>;

export const updateBookResponseBodyDtoSchema = bookDtoSchema;

export type UpdateBookResponseBodyDto = TypeExtends<
  Static<typeof updateBookResponseBodyDtoSchema>,
  UpdateBookResponseBody
>;
