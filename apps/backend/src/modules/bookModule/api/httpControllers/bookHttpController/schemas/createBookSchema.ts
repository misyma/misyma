import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookBodyDTOSchema = Type.Object({
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
  releaseYear: Type.Optional(Type.Integer()),
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
  pages: Type.Optional(Type.Integer()),
  imageUrl: Type.Optional(Type.String({ format: 'uri' })),
  status: Type.Enum(contracts.BookStatus),
  bookshelfId: Type.String({
    format: 'uuid',
  }),
  authorIds: Type.Array(
    Type.String({
      format: 'uuid',
    }),
  ),
});

export type CreateBookBodyDTO = TypeExtends<Static<typeof createBookBodyDTOSchema>, contracts.CreateBookRequestBody>;

export const createBookResponseBodyDTOSchema = bookDTOSchema;

export type CreateBookResponseBodyDTO = TypeExtends<
  Static<typeof createBookResponseBodyDTOSchema>,
  contracts.CreateBookResponseBody
>;
