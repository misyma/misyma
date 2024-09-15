import { type Static, Type } from '@sinclair/typebox';

export const bookReadingRatingSchema = Type.Integer({
  minimum: 1,
  maximum: 10,
});

export const bookReadingCommentSchema = Type.String({
  minLength: 1,
  maxLength: 256,
});

export const bookReadingDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
  rating: bookReadingRatingSchema,
  comment: Type.Optional(bookReadingCommentSchema),
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.String({ format: 'date-time' }),
});

export type BookReadingDto = Static<typeof bookReadingDtoSchema>;
