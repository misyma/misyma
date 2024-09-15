import { type Static, Type } from '@sinclair/typebox';

export const quoteContentSchema = Type.String({
  minLength: 1,
  maxLength: 256,
});

export const quotePageSchema = Type.String({
  minLength: 1,
  maxLength: 16,
});

export const quoteDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
  content: quoteContentSchema,
  isFavorite: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
  page: Type.Optional(quotePageSchema),
});

export type QuoteDto = Static<typeof quoteDtoSchema>;
