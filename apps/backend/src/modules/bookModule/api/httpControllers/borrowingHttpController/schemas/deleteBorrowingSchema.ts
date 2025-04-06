import { type DeleteBorrowingPathParams } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBorrowingPathParamsDtoSchema = Type.Object({
  borrowingId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteBorrowingPathParamsDto = TypeExtends<
  Static<typeof deleteBorrowingPathParamsDtoSchema>,
  DeleteBorrowingPathParams
>;

export const deleteBorrowingResponseBodyDtoSchema = Type.Null();

export type DeleteBorrowingResponseBodyDto = Static<typeof deleteBorrowingResponseBodyDtoSchema>;
