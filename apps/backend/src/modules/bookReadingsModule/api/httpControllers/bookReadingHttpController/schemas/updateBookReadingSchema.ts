import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookReadingPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookReadingPathParamsDTO = TypeExtends<
  Static<typeof updateBookReadingPathParamsDTOSchema>,
  contracts.UpdateBookReadingPathParams
>;

export const updateBookReadingBodyDTOSchema = Type.Object({
  comment: Type.Optional(Type.String()),
  rating: Type.Optional(Type.Number()),
  startedAt: Type.Optional(Type.Date()),
  endedAt: Type.Optional(Type.Date()),
});

export type UpdateBookReadingBodyDTO = TypeExtends<
  Static<typeof updateBookReadingBodyDTOSchema>,
  contracts.UpdateBookReadingRequestBody
>;

export const updateBookReadingResponseBodyDTOSchema = Type.Object({
  bookReading: bookReadingDTOSchema,
});

export type UpdateBookReadingResponseBodyDTO = TypeExtends<
  Static<typeof updateBookReadingResponseBodyDTOSchema>,
  contracts.UpdateBookReadingResponseBody
>;
