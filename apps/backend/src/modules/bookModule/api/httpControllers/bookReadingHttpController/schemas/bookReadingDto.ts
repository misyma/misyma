import { type Static, Type } from '@sinclair/typebox';

export const bookReadingDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
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

export type BookReadingDTO = Static<typeof bookReadingDTOSchema>;
