import { type Static, Type } from '@sinclair/typebox';

export const bookshelfDTOSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  userId: Type.String(),
  addressId: Type.Optional(Type.String()),
});

export type BookshelfDTO = Static<typeof bookshelfDTOSchema>;
