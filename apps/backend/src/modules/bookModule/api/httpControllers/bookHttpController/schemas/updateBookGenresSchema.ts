import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookGenresPathParamsDTOSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookGenresPathParamsDTO = TypeExtends<
  Static<typeof updateBookGenresPathParamsDTOSchema>,
  contracts.UpdateBookGenresPathParams
>;

export const updateBookGenresBodyDTOSchema = Type.Object({
  genreIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type UpdateBookGenresBodyDTO = TypeExtends<
  Static<typeof updateBookGenresBodyDTOSchema>,
  contracts.UpdateBookGenresRequestBody
>;

export const updateBookGenresResponseDTOSchema = bookDTOSchema;

export type UpdateBookGenresResponseDTOSchema = TypeExtends<
  Static<typeof updateBookGenresResponseDTOSchema>,
  contracts.UpdateBookGenresResponseBody
>;
