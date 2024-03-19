import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDto.js';
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
  authorIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type CreateBookBodyDTO = TypeExtends<Static<typeof createBookBodyDTOSchema>, contracts.CreateBookRequestBody>;

export const createBookResponseBodyDTOSchema = bookDTOSchema;

export type CreateBookResponseBodyDTO = TypeExtends<
  Static<typeof createBookResponseBodyDTOSchema>,
  contracts.CreateBookResponseBody
>;
