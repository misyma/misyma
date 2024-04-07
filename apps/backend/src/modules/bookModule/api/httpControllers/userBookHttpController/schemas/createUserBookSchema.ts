import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createUserBookBodyDTOSchema = Type.Object({
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

export type CreateUserBookBodyDTO = TypeExtends<
  Static<typeof createUserBookBodyDTOSchema>,
  contracts.CreateUserBookRequestBody
>;

export const createUserBookResponseBodyDTOSchema = userBookDTOSchema;

export type CreateUserBookResponseBodyDTO = TypeExtends<
  Static<typeof createUserBookResponseBodyDTOSchema>,
  contracts.CreateUserBookResponseBody
>;
