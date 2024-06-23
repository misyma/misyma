import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDtoSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookReadingPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateBookReadingPathParamsDto = TypeExtends<
  Static<typeof createBookReadingPathParamsDtoSchema>,
  contracts.CreateBookReadingPathParams
>;

export const createBookReadingBodyDtoSchema = Type.Object({
  rating: Type.Integer({
    minimum: 1,
    maximum: 10,
  }),
  comment: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.String({ format: 'date-time' }),
});

export type CreateBookReadingBodyDto = TypeExtends<
  Static<typeof createBookReadingBodyDtoSchema>,
  contracts.CreateBookReadingRequestBody
>;

export const createBookReadingResponseBodyDtoSchema = bookReadingDtoSchema;

export type CreateBookReadingResponseBodyDto = TypeExtends<
  Static<typeof createBookReadingResponseBodyDtoSchema>,
  contracts.CreateBookReadingResponseBody
>;
