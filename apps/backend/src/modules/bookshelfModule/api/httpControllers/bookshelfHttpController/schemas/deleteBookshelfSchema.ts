import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookshelfPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type DeleteBookshelfPathParamsDTO = TypeExtends<
  Static<typeof deleteBookshelfPathParamsDTOSchema>,
  contracts.DeleteBookshelfParams
>;

export const deleteBookshelfResponseBodyDTOSchema = Type.Null();

export type DeleteBookshelfResponseBodyDTO = Static<typeof deleteBookshelfResponseBodyDTOSchema>;
