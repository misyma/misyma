import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookshelfPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type UpdateBookshelfPathParamsDTO = TypeExtends<
  Static<typeof updateBookshelfPathParamsDTOSchema>,
  contracts.UpdateBookshelfPathParams
>;

export const updateBookshelfBodyDTOSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  imageUrl: Type.Optional(Type.String({ minLength: 1 })),
});

export type UpdateBookshelfBodyDTO = TypeExtends<
  Static<typeof updateBookshelfBodyDTOSchema>,
  contracts.UpdateBookshelfRequestBody
>;

export const updateBookshelfResponseBodyDTOSchema = Type.Object({
  bookshelf: bookshelfDTOSchema,
});

export type UpdateBookshelfResponseBodyDTO = TypeExtends<
  Static<typeof updateBookshelfResponseBodyDTOSchema>,
  contracts.UpdateBookshelfResponseBody
>;
