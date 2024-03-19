import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookshelfBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  userId: Type.String({ format: 'uuid' }),
  addressId: Type.Optional(Type.String({ format: 'uuid' })),
  imageUrl: Type.String({
    minLength: 1,
    maxLength: 128,
  }),
});

export type CreateBookshelfBodyDTO = TypeExtends<
  Static<typeof createBookshelfBodyDTOSchema>,
  contracts.CreateBookshelfRequestBody
>;

export const createBookshelfResponseBodyDTOSchema = bookshelfDTOSchema;

export type CreateBookshelfResponseBodyDTO = TypeExtends<
  Static<typeof createBookshelfResponseBodyDTOSchema>,
  contracts.CreateBookshelfResponseBody
>;
