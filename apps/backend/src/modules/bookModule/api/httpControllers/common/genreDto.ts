import { type Static, Type } from '@sinclair/typebox';

export const genreDtoSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type GenreDto = Static<typeof genreDtoSchema>;
