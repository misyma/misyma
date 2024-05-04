import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDtoSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookshelfBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type CreateBookshelfBodyDto = TypeExtends<
  Static<typeof createBookshelfBodyDtoSchema>,
  contracts.CreateBookshelfRequestBody
>;

export const createBookshelfResponseBodyDtoSchema = bookshelfDtoSchema;

export type CreateBookshelfResponseBodyDto = TypeExtends<
  Static<typeof createBookshelfResponseBodyDtoSchema>,
  contracts.CreateBookshelfResponseBody
>;
