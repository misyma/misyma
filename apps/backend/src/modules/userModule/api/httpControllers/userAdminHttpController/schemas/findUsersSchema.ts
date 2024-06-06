import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDtoSchema } from '../../common/userDto.js';

export const findUsersQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindUsersQueryParamsDto = TypeExtends<
  Static<typeof findUsersQueryParamsDtoSchema>,
  contracts.FindUsersQueryParams
>;

export const findUsersResponseBodyDtoSchema = Type.Object({
  data: Type.Array(userDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindUsersResponseBodyDto = TypeExtends<
  Static<typeof findUsersResponseBodyDtoSchema>,
  contracts.FindUsersResponseBody
>;
