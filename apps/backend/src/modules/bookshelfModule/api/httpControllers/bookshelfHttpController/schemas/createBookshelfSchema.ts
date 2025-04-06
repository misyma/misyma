import { type CreateBookshelfRequestBody, type CreateBookshelfResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookshelfDtoSchema, bookshelfImageUrlSchema, bookshelfNameSchema } from './bookshelfDto.js';

export const createBookshelfBodyDtoSchema = Type.Object({
  name: bookshelfNameSchema,
  imageUrl: Type.Optional(bookshelfImageUrlSchema),
});

export type CreateBookshelfBodyDto = TypeExtends<
  Static<typeof createBookshelfBodyDtoSchema>,
  CreateBookshelfRequestBody
>;

export const createBookshelfResponseBodyDtoSchema = bookshelfDtoSchema;

export type CreateBookshelfResponseBodyDto = TypeExtends<
  Static<typeof createBookshelfResponseBodyDtoSchema>,
  CreateBookshelfResponseBody
>;
