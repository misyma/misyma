import { type Static, Type } from '@sinclair/typebox';

export const genreDTO = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
  name: Type.String(),
});

export type GenreDTO = Static<typeof genreDTO>;
