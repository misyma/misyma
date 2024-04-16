import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookReadingPathParamsDTOSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateBookReadingPathParamsDTO = TypeExtends<
  Static<typeof createBookReadingPathParamsDTOSchema>,
  contracts.CreateBookReadingPathParams
>;

export const createBookReadingBodyDTOSchema = Type.Object({
  comment: Type.String({
    minLength: 1,
    maxLength: 256,
  }),
  rating: Type.Number({
    minimum: 1,
    maximum: 10,
  }),
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type CreateBookReadingBodyDTO = TypeExtends<
  Static<typeof createBookReadingBodyDTOSchema>,
  contracts.CreateBookReadingRequestBody
>;

export const createBookReadingResponseBodyDTOSchema = bookReadingDTOSchema;

export type CreateBookReadingResponseBodyDTO = TypeExtends<
  Static<typeof createBookReadingResponseBodyDTOSchema>,
  contracts.CreateBookReadingResponseBody
>;
