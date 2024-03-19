import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { authorDTOSchema } from './authorDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createAuthorBodyDTOSchema = Type.Object({
  firstName: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  lastName: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type CreateAuthorBodyDTO = TypeExtends<
  Static<typeof createAuthorBodyDTOSchema>,
  contracts.CreateAuthorRequestBody
>;

export const createAuthorResponseBodyDTOSchema = authorDTOSchema;

export type CreateAuthorResponseBodyDTO = TypeExtends<
  Static<typeof createAuthorResponseBodyDTOSchema>,
  contracts.CreateAuthorResponseBody
>;
