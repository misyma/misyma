import { type Static, Type } from '@sinclair/typebox';

export const authorNameSchema = Type.String({
  minLength: 1,
  maxLength: 128,
  pattern: '^[A-Za-z]+ [A-Za-z]+$',
});

export const authorDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: authorNameSchema,
  isApproved: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
});

export type AuthorDto = Static<typeof authorDtoSchema>;
