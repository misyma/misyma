import { type Static, Type } from '@sinclair/typebox';

import { bookSchema } from './bookSchema.js';

export const createBookBodySchema = Type.Object({
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorId: Type.String(),
});

export type CreateBookBody = Static<typeof createBookBodySchema>;

export const createBookResponseCreatedBodySchema = Type.Object({
  book: bookSchema,
});

export type CreateBookResponseCreatedBody = Static<typeof createBookResponseCreatedBodySchema>;
