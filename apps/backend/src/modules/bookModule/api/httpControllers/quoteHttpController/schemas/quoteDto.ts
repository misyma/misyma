import { type Static, Type } from '@sinclair/typebox';

export const quoteDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
  content: Type.String({
    minLength: 1,
    maxLength: 256,
  }),
  isFavorite: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
});

export type QuoteDto = Static<typeof quoteDtoSchema>;
