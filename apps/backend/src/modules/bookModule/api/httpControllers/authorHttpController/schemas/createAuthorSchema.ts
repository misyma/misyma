import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDtoSchema, authorNameSchema } from '../../../../../bookModule/api/httpControllers/common/authorDto.js';

export const createAuthorBodyDtoSchema = Type.Object({
  name: authorNameSchema,
});

export type CreateAuthorBodyDto = TypeExtends<
  Static<typeof createAuthorBodyDtoSchema>,
  contracts.CreateAuthorRequestBody
>;

export const createAuthorResponseBodyDtoSchema = authorDtoSchema;

export type CreateAuthorResponseBodyDto = TypeExtends<
  Static<typeof createAuthorResponseBodyDtoSchema>,
  contracts.CreateAuthorResponseBody
>;
