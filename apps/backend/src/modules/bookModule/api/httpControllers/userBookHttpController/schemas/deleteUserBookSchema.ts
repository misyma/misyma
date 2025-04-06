import { type DeleteUserBookPathParams } from '@common/contracts';
import { Type, type Static } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteUserBookPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteUserBookPathParamsDto = TypeExtends<
  Static<typeof deleteUserBookPathParamsDtoSchema>,
  DeleteUserBookPathParams
>;

export const deleteUserBookResponseBodyDtoSchema = Type.Null();

export type DeleteUserBookResponseBodyDto = Static<typeof deleteUserBookResponseBodyDtoSchema>;
