import { type Static, Type } from '@sinclair/typebox';

export const collectionDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  userId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
});

export type CollectionDto = Static<typeof collectionDtoSchema>;
