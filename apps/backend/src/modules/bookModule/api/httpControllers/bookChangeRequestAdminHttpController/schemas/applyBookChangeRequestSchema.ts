import { type ApplyBookChangeRequestPathParams } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const applyBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type ApplyBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof applyBookChangeRequestPathParamsDtoSchema>,
  ApplyBookChangeRequestPathParams
>;

export const applyBookChangeRequestResponseBodyDtoSchema = Type.Null();

export type ApplyBookChangeRequestResponseBodyDto = Static<typeof applyBookChangeRequestResponseBodyDtoSchema>;
