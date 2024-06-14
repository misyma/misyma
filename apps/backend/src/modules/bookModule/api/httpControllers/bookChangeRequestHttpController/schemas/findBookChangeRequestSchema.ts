import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type FindBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof findBookChangeRequestPathParamsDtoSchema>,
  contracts.FindBookChangeRequestPathParams
>;

export const findBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type FindBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof findBookChangeRequestResponseBodyDtoSchema>,
  contracts.FindBookChangeRequestResponseBody
>;
