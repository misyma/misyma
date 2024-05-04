import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDtoSchema } from '../../../../../bookModule/api/httpControllers/common/authorDto.js';

export const findAuthorPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindAuthorPathParamsDto = TypeExtends<
  Static<typeof findAuthorPathParamsDtoSchema>,
  contracts.FindAuthorPathParams
>;

export const findAuthorResponseBodyDtoSchema = authorDtoSchema;

export type FindAuthorResponseBodyDto = TypeExtends<
  Static<typeof findAuthorResponseBodyDtoSchema>,
  contracts.FindAuthorResponseBody
>;
