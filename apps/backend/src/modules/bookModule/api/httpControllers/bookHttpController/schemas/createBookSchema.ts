import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookBodyDTOSchema = Type.Object({
  title: Type.String(),
  isbn: Type.Optional(Type.String()),
  publisher: Type.Optional(Type.String()),
  releaseYear: Type.Optional(Type.Integer()),
  language: Type.String(),
  translator: Type.Optional(Type.String()),
  format: Type.Enum(contracts.BookFormat),
  pages: Type.Optional(Type.Integer()),
  frontCoverImageUrl: Type.Optional(Type.String()),
  backCoverImageUrl: Type.Optional(Type.String()),
  status: Type.Enum(contracts.BookStatus),
  bookshelfId: Type.String({
    format: 'uuid',
    description: 'Bookshelf id.',
  }),
  authorIds: Type.Array(
    Type.String({
      format: 'uuid',
      description: 'Author id.',
    }),
  ),
});

export type CreateBookBodyDTO = TypeExtends<Static<typeof createBookBodyDTOSchema>, contracts.CreateBookRequestBody>;

export const createBookResponseBodyDTOSchema = bookDTOSchema;

export type CreateBookResponseBodyDTO = TypeExtends<
  Static<typeof createBookResponseBodyDTOSchema>,
  contracts.CreateBookResponseBody
>;
