import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

export const userBookDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  status: Type.Enum(contracts.ReadingStatus),
  bookshelfId: Type.String({ format: 'uuid' }),
  genres: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    }),
  ),
  bookId: Type.String({ format: 'uuid' }),
  book: Type.Object({
    title: Type.String({
      minLength: 1,
      maxLength: 64,
    }),
    isbn: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    publisher: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    releaseYear: Type.Optional(
      Type.Integer({
        minimum: 1500,
        maximum: 2500,
      }),
    ),
    language: Type.String(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    translator: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 64,
      }),
    ),
    format: Type.Enum(contracts.BookFormat),
    pages: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 10000,
      }),
    ),
    isApproved: Type.Boolean(),
    authors: Type.Array(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String({
          minLength: 1,
          maxLength: 128,
        }),
        isApproved: Type.Boolean(),
      }),
    ),
  }),
});

export type UserBookDTO = Static<typeof userBookDTOSchema>;
