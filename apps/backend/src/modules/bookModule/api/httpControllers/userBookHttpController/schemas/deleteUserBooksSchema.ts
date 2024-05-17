import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteUserBooksQueryParamsDtoSchema = Type.Object({
  ids: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 }),
});

export type DeleteUserBooksQueryParamsDto = TypeExtends<
  Static<typeof deleteUserBooksQueryParamsDtoSchema>,
  contracts.DeleteUserBooksQueryParams
>;

export const deleteUserBooksResponseBodyDtoSchema = Type.Null();

export type DeleteUserBooksResponseBodyDto = Static<typeof deleteUserBooksResponseBodyDtoSchema>;
