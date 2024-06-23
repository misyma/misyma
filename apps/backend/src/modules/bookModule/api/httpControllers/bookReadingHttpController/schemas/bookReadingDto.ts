import { type Static, Type } from '@sinclair/typebox';

export const bookReadingDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
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

export type BookReadingDto = Static<typeof bookReadingDtoSchema>;
