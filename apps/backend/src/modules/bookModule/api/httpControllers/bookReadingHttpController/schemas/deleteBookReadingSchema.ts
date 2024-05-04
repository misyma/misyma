import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookReadingPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteBookReadingPathParamsDto = TypeExtends<
  Static<typeof deleteBookReadingPathParamsDtoSchema>,
  contracts.DeleteBookReadingPathParams
>;

export const deleteBookReadingResponseBodyDtoSchema = Type.Null();

export type DeleteBookReadingResponseBodyDto = Static<typeof deleteBookReadingResponseBodyDtoSchema>;
