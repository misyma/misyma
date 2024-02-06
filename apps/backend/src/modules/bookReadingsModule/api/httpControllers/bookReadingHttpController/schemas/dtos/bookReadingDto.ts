import { type Static, Type } from '@sinclair/typebox';

export const bookReadingDTOSchema = Type.Object({
  id: Type.String(),
  bookId: Type.String(),
  comment: Type.String(),
  rating: Type.Number(),
  startedAt: Type.Date(),
  endedAt: Type.Optional(Type.Date()),
});

export type BookReadingDTO = Static<typeof bookReadingDTOSchema>;
