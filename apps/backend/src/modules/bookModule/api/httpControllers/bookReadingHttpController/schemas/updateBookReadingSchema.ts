import {
  type UpdateBookReadingPathParams,
  type UpdateBookReadingRequestBody,
  type UpdateBookReadingResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookReadingCommentSchema, bookReadingDtoSchema, bookReadingRatingSchema } from './bookReadingDto.js';

export const updateBookReadingPathParamsDtoSchema = Type.Object({
  readingId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookReadingPathParamsDto = TypeExtends<
  Static<typeof updateBookReadingPathParamsDtoSchema>,
  UpdateBookReadingPathParams
>;

export const updateBookReadingBodyDtoSchema = Type.Object({
  rating: Type.Optional(bookReadingRatingSchema),
  comment: Type.Optional(bookReadingCommentSchema),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type UpdateBookReadingBodyDto = TypeExtends<
  Static<typeof updateBookReadingBodyDtoSchema>,
  UpdateBookReadingRequestBody
>;

export const updateBookReadingResponseBodyDtoSchema = bookReadingDtoSchema;

export type UpdateBookReadingResponseBodyDto = TypeExtends<
  Static<typeof updateBookReadingResponseBodyDtoSchema>,
  UpdateBookReadingResponseBody
>;
