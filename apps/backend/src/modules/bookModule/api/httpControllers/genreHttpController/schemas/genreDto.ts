import { type Static, Type } from '@sinclair/typebox';

export const genreDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type GenreDTO = Static<typeof genreDTOSchema>;
