import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookReadingPathParamsDTOSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type CreateBookReadingPathParamsDTO = TypeExtends<
  Static<typeof createBookReadingPathParamsDTOSchema>,
  contracts.CreateBookReadingPathParams
>;

export const createBookReadingBodyDTOSchema = Type.Object({
  comment: Type.String(),
  rating: Type.Number(),
  startedAt: Type.Date(),
  endedAt: Type.Optional(Type.Date()),
});

export type CreateBookReadingBodyDTO = TypeExtends<
  Static<typeof createBookReadingBodyDTOSchema>,
  contracts.CreateBookReadingBody
>;

export const createBookReadingResponseBodyDTOSchema = Type.Object({
  bookReading: bookReadingDTOSchema,
});

export type CreateBookReadingResponseBodyDTO = TypeExtends<
  Static<typeof createBookReadingResponseBodyDTOSchema>,
  contracts.CreateBookReadingResponseBody
>;
