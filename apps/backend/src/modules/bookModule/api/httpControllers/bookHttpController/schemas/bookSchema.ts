import { Type } from '@sinclair/typebox';

export const bookSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorId: Type.String(),
});
