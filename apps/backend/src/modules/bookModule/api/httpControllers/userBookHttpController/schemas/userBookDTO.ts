import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { authorDTOSchema } from '../../bookHttpController/schemas/authorDTO.js';
import { genreDTOSchema } from '../../bookHttpController/schemas/genreDTO.js';

export const userBookDTOSchema = Type.Object({
  id: Type.String(),
  imageUrl: Type.Optional(Type.String()),
  status: Type.Enum(contracts.ReadingStatus),
  bookshelfId: Type.String(),
  bookId: Type.String(),
  book: Type.Object({
    title: Type.String(),
    isbn: Type.Optional(Type.String()),
    publisher: Type.Optional(Type.String()),
    releaseYear: Type.Optional(Type.Integer()),
    language: Type.String(),
    translator: Type.Optional(Type.String()),
    format: Type.Enum(contracts.BookFormat),
    pages: Type.Optional(Type.Integer()),
    genres: Type.Array(genreDTOSchema),
    authors: Type.Array(authorDTOSchema),
  }),
});

export type UserBookDTO = Static<typeof userBookDTOSchema>;
