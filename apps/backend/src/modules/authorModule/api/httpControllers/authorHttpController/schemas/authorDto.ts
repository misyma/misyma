import { type Static, Type } from '@sinclair/typebox';

export const authorDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  firstName: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  lastName: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type AuthorDTO = Static<typeof authorDTOSchema>;
