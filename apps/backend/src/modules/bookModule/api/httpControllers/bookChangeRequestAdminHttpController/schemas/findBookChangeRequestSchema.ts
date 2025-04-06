import { type FindBookChangeRequestPathParams, type FindAdminBookChangeRequestResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type FindBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof findBookChangeRequestPathParamsDtoSchema>,
  FindBookChangeRequestPathParams
>;

export const findAdminBookChangeRequestResponseBodyDtoSchema = Type.Object({
  data: Type.Union([bookChangeRequestDtoSchema, Type.Undefined()]),
});

export type FindAdminBookChangeRequestResponseBodyDto = TypeExtends<
  FindAdminBookChangeRequestResponseBody,
  Static<typeof findAdminBookChangeRequestResponseBodyDtoSchema>
>;
