import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookReadingCommentSchema, bookReadingDtoSchema, bookReadingRatingSchema } from './bookReadingDto.js';

export const createBookReadingPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateBookReadingPathParamsDto = TypeExtends<
  Static<typeof createBookReadingPathParamsDtoSchema>,
  contracts.CreateBookReadingPathParams
>;

export const createBookReadingBodyDtoSchema = Type.Object({
  rating: bookReadingRatingSchema,
  comment: Type.Optional(bookReadingCommentSchema),
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
