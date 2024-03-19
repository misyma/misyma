import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { authorDTOSchema } from './authorDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findAuthorPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindAuthorPathParamsDTO = TypeExtends<
  Static<typeof findAuthorPathParamsDTOSchema>,
  contracts.FindAuthorPathParams
>;

export const findAuthorResponseBodyDTOSchema = authorDTOSchema;

export type FindAuthorResponseBodyDTO = TypeExtends<
  Static<typeof findAuthorResponseBodyDTOSchema>,
  contracts.FindAuthorResponseBody
>;
