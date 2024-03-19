import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBookPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindUserBookPathParamsDTO = TypeExtends<
  Static<typeof findUserBookPathParamsDTOSchema>,
  contracts.FindUserBookPathParams
>;

export const findUserBookResponseBodyDTOSchema = userBookDTOSchema;

export type FindUserBookResponseBodyDTO = TypeExtends<
  Static<typeof findUserBookResponseBodyDTOSchema>,
  contracts.FindUserBookResponseBody
>;
