import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDtoSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookReadingPathParamsDtoSchema = Type.Object({
  readingId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookReadingPathParamsDto = TypeExtends<
  Static<typeof updateBookReadingPathParamsDtoSchema>,
  contracts.UpdateBookReadingPathParams
>;

export const updateBookReadingBodyDtoSchema = Type.Object({
  comment: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
  rating: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 10,
    }),
  ),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type UpdateBookReadingBodyDto = TypeExtends<
  Static<typeof updateBookReadingBodyDtoSchema>,
  contracts.UpdateBookReadingRequestBody
>;

export const updateBookReadingResponseBodyDtoSchema = bookReadingDtoSchema;

export type UpdateBookReadingResponseBodyDto = TypeExtends<
  Static<typeof updateBookReadingResponseBodyDtoSchema>,
  contracts.UpdateBookReadingResponseBody
>;
