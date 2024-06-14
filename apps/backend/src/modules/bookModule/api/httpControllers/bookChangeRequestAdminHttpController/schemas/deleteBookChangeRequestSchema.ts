import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type DeleteBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof deleteBookChangeRequestPathParamsDtoSchema>,
  contracts.DeleteBookChangeRequestPathParams
>;

export const deleteBookChangeRequestResponseBodyDtoSchema = Type.Null();

export type DeleteBookChangeRequestResponseBodyDto = Static<typeof deleteBookChangeRequestResponseBodyDtoSchema>;
