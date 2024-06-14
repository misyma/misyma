import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const applyBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type ApplyBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof applyBookChangeRequestPathParamsDtoSchema>,
  contracts.ApplyBookChangeRequestPathParams
>;

export const applyBookChangeRequestResponseBodyDtoSchema = Type.Null();

export type ApplyBookChangeRequestResponseBodyDto = Static<typeof applyBookChangeRequestResponseBodyDtoSchema>;
