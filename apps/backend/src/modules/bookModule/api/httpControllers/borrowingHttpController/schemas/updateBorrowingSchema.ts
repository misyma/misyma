import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { borrowingDtoSchema } from './borrowingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBorrowingPathParamsDtoSchema = Type.Object({
  borrowingId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateBorrowingPathParamsDto = TypeExtends<
  Static<typeof updateBorrowingPathParamsDtoSchema>,
  contracts.UpdateBorrowingPathParams
>;

export const updateBorrowingBodyDtoSchema = Type.Object({
  borrower: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 32,
    }),
  ),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type UpdateBorrowingBodyDto = TypeExtends<
  Static<typeof updateBorrowingBodyDtoSchema>,
  contracts.UpdateBorrowingRequestBody
>;

export const updateBorrowingResponseBodyDtoSchema = borrowingDtoSchema;

export type UpdateBorrowingResponseBodyDto = TypeExtends<
  Static<typeof updateBorrowingResponseBodyDtoSchema>,
  contracts.UpdateBorrowingResponseBody
>;
