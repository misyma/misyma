import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingCommentSchema, bookReadingDtoSchema, bookReadingRatingSchema } from './bookReadingDto.js';
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
  rating: Type.Optional(bookReadingRatingSchema),
  comment: Type.Optional(bookReadingCommentSchema),
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
