import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteUserBookPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteUserBookPathParamsDto = TypeExtends<
  Static<typeof deleteUserBookPathParamsDtoSchema>,
  contracts.DeleteUserBookPathParams
>;

export const deleteUserBookResponseBodyDtoSchema = Type.Null();

export type DeleteUserBookResponseBodyDto = Static<typeof deleteUserBookResponseBodyDtoSchema>;
