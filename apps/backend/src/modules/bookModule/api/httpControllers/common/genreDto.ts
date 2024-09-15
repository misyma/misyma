import { type Static, Type } from '@sinclair/typebox';

export const genreNameSchema = Type.String({
  minLength: 1,
  maxLength: 64,
});

export const genreDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: genreNameSchema,
});

export type GenreDto = Static<typeof genreDtoSchema>;
