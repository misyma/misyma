import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingsPathParamsDTOSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingsPathParamsDTO = TypeExtends<
  Static<typeof findBookReadingsPathParamsDTOSchema>,
  contracts.FindBookReadingsPathParams
>;

export const findBookReadingsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookReadingDTOSchema),
});

export type FindBookReadingsResponseBodyDTO = TypeExtends<
  Static<typeof findBookReadingsResponseBodyDTOSchema>,
  contracts.FindBookReadingsResponseBody
>;
