import { type Static, Type } from '@sinclair/typebox';

export const bookReadingDTOSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  userId: Type.String(),
  addressId: Type.Optional(Type.String()),
});

export type BookReadingDTO = Static<typeof bookReadingDTOSchema>;
