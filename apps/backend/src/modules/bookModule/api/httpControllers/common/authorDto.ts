import { type Static, Type } from '@sinclair/typebox';

export const authorNameSchema = Type.String({
  minLength: 3,
  maxLength: 128,
});

export const authorDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: authorNameSchema,
  isApproved: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
});

export type AuthorDto = Static<typeof authorDtoSchema>;
