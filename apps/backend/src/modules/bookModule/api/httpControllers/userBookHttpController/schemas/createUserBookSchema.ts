import * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookImageUrlSchema } from '../../common/bookDto.js';

import { userBookDtoSchema } from './userBookDto.js';

export const createUserBookBodyDtoSchema = Type.Object({
  imageUrl: Type.Optional(bookImageUrlSchema),
  status: Type.Enum(contracts.ReadingStatus),
  isFavorite: Type.Boolean(),
  bookshelfId: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
  genreId: Type.String({ format: 'uuid' }),
  collectionIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type CreateUserBookBodyDto = TypeExtends<
  Static<typeof createUserBookBodyDtoSchema>,
  contracts.CreateUserBookRequestBody
>;

export const createUserBookResponseBodyDtoSchema = userBookDtoSchema;

export type CreateUserBookResponseBodyDto = TypeExtends<
  Static<typeof createUserBookResponseBodyDtoSchema>,
  contracts.CreateUserBookResponseBody
>;
