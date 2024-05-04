import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createUserBookBodyDtoSchema = Type.Object({
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  status: Type.Enum(contracts.ReadingStatus),
  bookshelfId: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
  genreIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
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
