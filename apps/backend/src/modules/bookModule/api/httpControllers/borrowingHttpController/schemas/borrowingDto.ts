import { type Static, Type } from '@sinclair/typebox';

export const borrowingBorrowerSchema = Type.String({
  minLength: 1,
  maxLength: 32,
});

export const borrowingDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
  borrower: borrowingBorrowerSchema,
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type BorrowingDto = Static<typeof borrowingDtoSchema>;
