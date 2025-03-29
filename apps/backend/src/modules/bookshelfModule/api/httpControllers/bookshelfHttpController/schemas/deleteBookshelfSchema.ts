import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookshelfPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type DeleteBookshelfPathParamsDto = TypeExtends<
  Static<typeof deleteBookshelfPathParamsDtoSchema>,
  contracts.DeleteBookshelfParams
>;

export const deleteBookshelfQueryParamsDtoSchema = Type.Object({
  fallbackBookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
});

export type DeleteBookshelfQueryParamsDto = TypeExtends<
  Static<typeof deleteBookshelfQueryParamsDtoSchema>,
  contracts.DeleteBookshelfQueryParams
>;

export const deleteBookshelfResponseBodyDtoSchema = Type.Null();

export type DeleteBookshelfResponseBodyDto = Static<typeof deleteBookshelfResponseBodyDtoSchema>;
