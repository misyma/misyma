import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookReadingPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteBookReadingPathParamsDTO = TypeExtends<
  Static<typeof deleteBookReadingPathParamsDTOSchema>,
  contracts.DeleteBookReadingPathParams
>;

export const deleteBookReadingResponseBodyDTOSchema = Type.Null();

export type DeleteBookReadingResponseBodyDTO = Static<typeof deleteBookReadingResponseBodyDTOSchema>;
