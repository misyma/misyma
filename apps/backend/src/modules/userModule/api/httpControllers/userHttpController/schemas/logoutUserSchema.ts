import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const logoutUserPathParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type LogoutUserPathParamsDto = TypeExtends<
  Static<typeof logoutUserPathParamsDtoSchema>,
  contracts.LogoutUserPathParams
>;

export const logoutUserBodyDtoSchema = Type.Object({
  refreshToken: Type.String(),
  accessToken: Type.String(),
});

export type LogoutUserBodyDto = TypeExtends<Static<typeof logoutUserBodyDtoSchema>, contracts.LogoutUserRequestBody>;

export const logoutUserResponseBodyDtoSchema = Type.Null();

export type LogoutUserResponseBodyDto = Static<typeof logoutUserResponseBodyDtoSchema>;
