import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDtoSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingByIdPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingByIdPathParamsDto = TypeExtends<
  Static<typeof findBookReadingByIdPathParamsDtoSchema>,
  contracts.FindBookReadingByIdPathParams
>;

export const findBookReadingByIdResponseBodyDtoSchema = bookReadingDtoSchema;

export type FindBookReadingByIdResponseBodyDto = TypeExtends<
  Static<typeof findBookReadingByIdResponseBodyDtoSchema>,
  contracts.FindBookReadingByIdResponseBody
>;
