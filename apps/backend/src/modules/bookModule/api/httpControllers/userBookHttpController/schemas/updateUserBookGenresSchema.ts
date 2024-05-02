import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

// TODO: move to update user book
export const updateUserBookGenresPathParamsDTOSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateUserBookGenresPathParamsDTO = TypeExtends<
  Static<typeof updateUserBookGenresPathParamsDTOSchema>,
  contracts.UpdateUserBookGenresPathParams
>;

export const updateUserBookGenresBodyDTOSchema = Type.Object({
  genreIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type UpdateUserBookGenresBodyDTO = TypeExtends<
  Static<typeof updateUserBookGenresBodyDTOSchema>,
  contracts.UpdateUserBookGenresRequestBody
>;

export const updateUserBookGenresResponseBodyDTOSchema = userBookDTOSchema;

export type UpdateUserBookGenresResponseBodyDTOSchema = TypeExtends<
  Static<typeof updateUserBookGenresResponseBodyDTOSchema>,
  contracts.UpdateUserBookGenresResponseBody
>;
