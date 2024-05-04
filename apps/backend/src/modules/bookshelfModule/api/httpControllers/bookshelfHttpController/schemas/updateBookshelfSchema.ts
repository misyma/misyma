import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDtoSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookshelfPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type UpdateBookshelfPathParamsDto = TypeExtends<
  Static<typeof updateBookshelfPathParamsDtoSchema>,
  contracts.UpdateBookshelfPathParams
>;

export const updateBookshelfBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type UpdateBookshelfBodyDto = TypeExtends<
  Static<typeof updateBookshelfBodyDtoSchema>,
  contracts.UpdateBookshelfRequestBody
>;

export const updateBookshelfResponseBodyDtoSchema = bookshelfDtoSchema;

export type UpdateBookshelfResponseBodyDto = TypeExtends<
  Static<typeof updateBookshelfResponseBodyDtoSchema>,
  contracts.UpdateBookshelfResponseBody
>;
