import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteUserBookPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type DeleteUserBookPathParamsDTO = TypeExtends<
  Static<typeof deleteUserBookPathParamsDTOSchema>,
  contracts.DeleteUserBookPathParams
>;

export const deleteUserBookResponseBodyDTOSchema = Type.Null();

export type DeleteUserBookResponseBodyDTO = Static<typeof deleteUserBookResponseBodyDTOSchema>;
