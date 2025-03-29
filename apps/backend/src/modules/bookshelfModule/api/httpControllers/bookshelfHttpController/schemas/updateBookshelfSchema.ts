import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookshelfDtoSchema, bookshelfImageUrlSchema, bookshelfNameSchema } from './bookshelfDto.js';

export const updateBookshelfPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type UpdateBookshelfPathParamsDto = TypeExtends<
  Static<typeof updateBookshelfPathParamsDtoSchema>,
  contracts.UpdateBookshelfPathParams
>;

export const updateBookshelfBodyDtoSchema = Type.Object({
  name: bookshelfNameSchema,
  imageUrl: Type.Optional(Type.Union([bookshelfImageUrlSchema, Type.Null()])),
});

export type UpdateBookshelfBodyDto = TypeExtends<
  Static<typeof updateBookshelfBodyDtoSchema>,
  contracts.UpdateBookshelfRequestBody
>;

export const updateBookshelfResponseBodyDtoSchema = bookshelfDtoSchema;

export type UpdateBookshelfResponseBodyDto = TypeExtends<
  Static<typeof updateBookshelfResponseBodyDtoSchema>,
  contracts.UpdateBookshelfResponseBody
>;
