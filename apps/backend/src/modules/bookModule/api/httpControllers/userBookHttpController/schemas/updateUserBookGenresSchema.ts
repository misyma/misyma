import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

// TODO: move to update user book
export const updateUserBookGenresPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateUserBookGenresPathParamsDto = TypeExtends<
  Static<typeof updateUserBookGenresPathParamsDtoSchema>,
  contracts.UpdateUserBookGenresPathParams
>;

export const updateUserBookGenresBodyDtoSchema = Type.Object({
  genreIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type UpdateUserBookGenresBodyDto = TypeExtends<
  Static<typeof updateUserBookGenresBodyDtoSchema>,
  contracts.UpdateUserBookGenresRequestBody
>;

export const updateUserBookGenresResponseBodyDtoSchema = userBookDtoSchema;

export type UpdateUserBookGenresResponseBodyDtoSchema = TypeExtends<
  Static<typeof updateUserBookGenresResponseBodyDtoSchema>,
  contracts.UpdateUserBookGenresResponseBody
>;
