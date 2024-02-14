import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userDTOSchema } from './userDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserPathParamsDTOSchema = Type.Object({
  id: Type.String(),
});

export type FindUserPathParamsDTO = TypeExtends<
  Static<typeof findUserPathParamsDTOSchema>,
  contracts.FindUserPathParams
>;

export const findUserResponseBodyDTOSchema = userDTOSchema;

export type FindUserResponseBodyDTO = TypeExtends<
  Static<typeof findUserResponseBodyDTOSchema>,
  contracts.FindUserResponseBody
>;
