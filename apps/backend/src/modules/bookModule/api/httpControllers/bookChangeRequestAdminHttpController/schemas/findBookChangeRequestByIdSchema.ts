import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findBookChangeRequestByIdPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindBookChangeRequestByIdPathParamsDto = TypeExtends<
  Static<typeof findBookChangeRequestByIdPathParamsDtoSchema>,
  contracts.FindBookChangeRequestByIdPathParams
>;

export const findAdminBookChangeRequestByIdResponseBodyDtoSchema = Type.Object({
  data: Type.Union([bookChangeRequestDtoSchema, Type.Undefined()]),
});

export type FindAdminBookChangeRequestByIdResponseBodyDto = TypeExtends<
  contracts.FindAdminBookChangeRequestByIdResponseBody,
  Static<typeof findAdminBookChangeRequestByIdResponseBodyDtoSchema>
>;
