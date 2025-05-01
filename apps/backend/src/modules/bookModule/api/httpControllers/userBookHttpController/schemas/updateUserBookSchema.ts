import {
  type UpdateUserBookPathParams,
  type UpdateUserBookRequestBody,
  type UpdateUserBookResponseBody,
  readingStatuses,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookImageUrlSchema } from '../../common/bookDto.js';

import { userBookDtoSchema } from './userBookDto.js';

export const updateUserBookPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateUserBookPathParamsDto = TypeExtends<
  Static<typeof updateUserBookPathParamsDtoSchema>,
  UpdateUserBookPathParams
>;

export const updateUserBookBodyDtoSchema = Type.Object({
  status: Type.Optional(Type.Union(Object.values(readingStatuses).map((status) => Type.Literal(status)))),
  isFavorite: Type.Optional(Type.Boolean()),
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  imageUrl: Type.Optional(Type.Union([bookImageUrlSchema, Type.Null()])),
  categoryId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type UpdateUserBookBodyDto = TypeExtends<Static<typeof updateUserBookBodyDtoSchema>, UpdateUserBookRequestBody>;

export const updateUserBookResponseBodyDtoSchema = userBookDtoSchema;

export type UpdateUserBookResponseBodyDto = TypeExtends<
  Static<typeof updateUserBookResponseBodyDtoSchema>,
  UpdateUserBookResponseBody
>;
