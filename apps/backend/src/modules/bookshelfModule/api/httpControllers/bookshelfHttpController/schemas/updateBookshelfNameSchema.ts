import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookshelfNamePathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({
    format: 'uuid',
  }),
});

export type UpdateBookshelfNamePathParamsDTO = TypeExtends<
  Static<typeof updateBookshelfNamePathParamsDTOSchema>,
  contracts.UpdateBookshelfNamePathParams
>;

export const updateBookshelfNameBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
  }),
});

export type UpdateBookshelfNameBodyDTO = TypeExtends<
  Static<typeof updateBookshelfNameBodyDTOSchema>,
  contracts.UpdateBookshelfNameBody
>;

export const updateBookshelfNameOkResponseBodyDTOSchema = Type.Object({
  bookshelf: bookshelfDTOSchema,
});

export type UpdateBookshelfNameOkResponseBodyDTO = TypeExtends<
  Static<typeof updateBookshelfNameOkResponseBodyDTOSchema>,
  contracts.UpdateBookshelfNameResponseBody
>;
