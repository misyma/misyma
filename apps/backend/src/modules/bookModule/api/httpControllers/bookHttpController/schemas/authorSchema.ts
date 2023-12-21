import { type Static, Type } from '@sinclair/typebox';

export const authorDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type AuthorDTO = Static<typeof authorDTOSchema>;
