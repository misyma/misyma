import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingByIdPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingByIdPathParamsDTO = TypeExtends<
  Static<typeof findBookReadingByIdPathParamsDTOSchema>,
  contracts.FindBookReadingByIdPathParams
>;

export const findBookReadingByIdResponseBodyDTOSchema = Type.Object({
  bookReading: bookReadingDTOSchema,
});

export type FindBookReadingByIdResponseBodyDTO = TypeExtends<
  Static<typeof findBookReadingByIdResponseBodyDTOSchema>,
  contracts.FindBookReadingByIdResponseBody
>;
