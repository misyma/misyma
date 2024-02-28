import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookshelfBodyDTOSchema = Type.Object({
  name: Type.String(),
  userId: Type.String(),
  addressId: Type.Optional(Type.String()),
});

export type CreateBookshelfBodyDTO = TypeExtends<
  Static<typeof createBookshelfBodyDTOSchema>,
  contracts.CreateBookshelfRequestBody
>;

export const createBookshelfResponseBodyDTOSchema = Type.Object({
  bookshelf: bookshelfDTOSchema,
});

export type CreateBookshelfResponseBodyDTO = TypeExtends<
  Static<typeof createBookshelfResponseBodyDTOSchema>,
  contracts.CreateBookshelfResponseBody
>;
