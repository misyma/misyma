import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingsByUserIdPathParamsDTOSchema = Type.Object({
  userId: Type.String({
    format: 'uuid',
  }),
});

export type FindBookReadingsByUserIdPathParamsDTO = TypeExtends<
  Static<typeof findBookReadingsByUserIdPathParamsDTOSchema>,
  contracts.FindBookReadingsByUserIdParams
>;

export const findBookReadingsByUserIdOkResponseBodyDTOSchema = Type.Object({
  bookReadings: Type.Array(bookReadingDTOSchema),
});

export type FindBookReadingsByUserIdOkResponseBodyDTO = TypeExtends<
  Static<typeof findBookReadingsByUserIdOkResponseBodyDTOSchema>,
  contracts.FindBookReadingsByUserIdResponseBody
>;
