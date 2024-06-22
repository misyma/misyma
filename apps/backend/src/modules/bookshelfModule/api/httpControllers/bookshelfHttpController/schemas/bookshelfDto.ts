import { type Static, Type } from '@sinclair/typebox';

import { BookshelfType } from '@common/contracts';

export const bookshelfDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  userId: Type.String({ format: 'uuid' }),
  type: Type.Enum(BookshelfType),
  createdAt: Type.String({ format: 'date-time' }),
});

export type BookshelfDto = Static<typeof bookshelfDtoSchema>;
