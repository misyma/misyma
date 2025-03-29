import { BookshelfType } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

export const bookshelfNameSchema = Type.String({
  minLength: 1,
  maxLength: 64,
});

export const bookshelfImageUrlSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookshelfDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  name: bookshelfNameSchema,
  type: Type.Enum(BookshelfType),
  createdAt: Type.String({ format: 'date-time' }),
  imageUrl: Type.Optional(bookshelfImageUrlSchema),
  bookCount: Type.Integer(),
});

export type BookshelfDto = Static<typeof bookshelfDtoSchema>;
