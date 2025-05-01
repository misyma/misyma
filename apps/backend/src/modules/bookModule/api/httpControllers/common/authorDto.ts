import { type Static, Type } from '@sinclair/typebox';

export const authorNameSchema = Type.String({
  minLength: 3,
  maxLength: 128,
});

export const authorDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: authorNameSchema,
  isApproved: Type.Boolean(),
});

export type AuthorDto = Static<typeof authorDtoSchema>;
