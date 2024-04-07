import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

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

export const updateUserBookGenresResponseDTOSchema = userBookDTOSchema;

export type UpdateUserBookGenresResponseDTOSchema = TypeExtends<
  Static<typeof updateUserBookGenresResponseDTOSchema>,
  contracts.UpdateUserBookGenresResponseBody
>;
