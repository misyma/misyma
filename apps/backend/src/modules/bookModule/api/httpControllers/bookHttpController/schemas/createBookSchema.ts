import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { authorDTOSchema } from './authorSchema.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookBodyDTOSchema = Type.Object({
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorIds: Type.Array(
    Type.String({
      format: 'uuid',
      description: 'Author id.',
    }),
  ),
});

export type CreateBookBodyDTO = TypeExtends<Static<typeof createBookBodyDTOSchema>, contracts.CreateBookBody>;

export const createBookResponseBodyDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
  title: Type.String(),
  releaseYear: Type.Integer(),
  authors: Type.Array(authorDTOSchema),
});

export type CreateBookResponseBodyDTO = TypeExtends<
  Static<typeof createBookResponseBodyDTOSchema>,
  contracts.CreateBookResponseBody
>;
