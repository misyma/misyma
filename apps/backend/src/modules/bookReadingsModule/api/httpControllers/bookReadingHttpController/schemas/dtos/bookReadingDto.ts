import { type Static, Type } from '@sinclair/typebox';

export const bookReadingDTOSchema = Type.Object({
  id: Type.String(),
  userBookId: Type.String(),
  comment: Type.String(),
  rating: Type.Number(),
  startedAt: Type.String(),
  endedAt: Type.Optional(Type.String()),
});

export type BookReadingDTO = Static<typeof bookReadingDTOSchema>;
