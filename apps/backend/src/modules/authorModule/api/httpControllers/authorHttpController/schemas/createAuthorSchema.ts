import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

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

export const createAuthorResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type CreateAuthorResponseBodyDTO = TypeExtends<
  Static<typeof createAuthorResponseBodyDTOSchema>,
  contracts.CreateAuthorResponseBody
>;
