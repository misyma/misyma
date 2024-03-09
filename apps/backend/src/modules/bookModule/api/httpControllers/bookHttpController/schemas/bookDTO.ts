import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { authorDTOSchema } from './authorDTO.js';
import { genreDTOSchema } from './genreDTO.js';

export const bookDTOSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  isbn: Type.Optional(Type.String()),
  publisher: Type.Optional(Type.String()),
  releaseYear: Type.Optional(Type.Integer()),
  language: Type.String(),
  translator: Type.Optional(Type.String()),
  format: Type.Enum(contracts.BookFormat),
  pages: Type.Optional(Type.Integer()),
  imageUrl: Type.Optional(Type.String()),
  status: Type.Enum(contracts.BookStatus),
  bookshelfId: Type.String(),
  genres: Type.Array(genreDTOSchema),
  authors: Type.Array(authorDTOSchema),
});

export type BookDTO = Static<typeof bookDTOSchema>;
