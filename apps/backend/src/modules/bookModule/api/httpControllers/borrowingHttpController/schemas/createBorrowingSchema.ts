import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { borrowingDtoSchema } from './borrowingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBorrowingPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateBorrowingPathParamsDto = TypeExtends<
  Static<typeof createBorrowingPathParamsDtoSchema>,
  contracts.CreateBorrowingPathParams
>;

export const createBorrowingBodyDtoSchema = Type.Object({
  borrower: Type.String({
    minLength: 1,
    maxLength: 256,
  }),
  rating: Type.Integer({
    minimum: 1,
    maximum: 10,
  }),
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type CreateBorrowingBodyDto = TypeExtends<
  Static<typeof createBorrowingBodyDtoSchema>,
  contracts.CreateBorrowingRequestBody
>;

export const createBorrowingResponseBodyDtoSchema = borrowingDtoSchema;

export type CreateBorrowingResponseBodyDto = TypeExtends<
  Static<typeof createBorrowingResponseBodyDtoSchema>,
  contracts.CreateBorrowingResponseBody
>;
