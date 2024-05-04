import { type Static, Type } from '@sinclair/typebox';

export const bookshelfDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  userId: Type.String({ format: 'uuid' }),
});

export type BookshelfDto = Static<typeof bookshelfDtoSchema>;
