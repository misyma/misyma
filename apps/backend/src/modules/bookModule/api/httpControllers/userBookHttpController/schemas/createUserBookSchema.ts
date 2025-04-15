import { readingStatuses, type CreateUserBookRequestBody, type CreateUserBookResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookImageUrlSchema } from '../../common/bookDto.js';

import { userBookDtoSchema } from './userBookDto.js';

export const createUserBookBodyDtoSchema = Type.Object({
  imageUrl: Type.Optional(bookImageUrlSchema),
  status: Type.Union(Object.values(readingStatuses).map((status) => Type.Literal(status))),
  isFavorite: Type.Boolean(),
  bookshelfId: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
  collectionIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type CreateUserBookBodyDto = TypeExtends<Static<typeof createUserBookBodyDtoSchema>, CreateUserBookRequestBody>;

export const createUserBookResponseBodyDtoSchema = userBookDtoSchema;

export type CreateUserBookResponseBodyDto = TypeExtends<
  Static<typeof createUserBookResponseBodyDtoSchema>,
  CreateUserBookResponseBody
>;
