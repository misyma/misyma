import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookBodyDTOSchema = Type.Object({
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorId: Type.String(),
});

export type CreateBookBodyDTO = TypeExtends<Static<typeof createBookBodyDTOSchema>, contracts.CreateBookBody>;

export const createBookResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorId: Type.String(),
});

export type CreateBookResponseBodyDTO = TypeExtends<
  Static<typeof createBookResponseBodyDTOSchema>,
  contracts.CreateBookResponseBody
>;
