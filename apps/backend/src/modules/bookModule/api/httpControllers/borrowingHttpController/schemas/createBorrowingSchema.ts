import {
  type CreateBorrowingPathParams,
  type CreateBorrowingRequestBody,
  type CreateBorrowingResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { borrowingBorrowerSchema, borrowingDtoSchema } from './borrowingDto.js';

export const createBorrowingPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type CreateBorrowingPathParamsDto = TypeExtends<
  Static<typeof createBorrowingPathParamsDtoSchema>,
  CreateBorrowingPathParams
>;

export const createBorrowingBodyDtoSchema = Type.Object({
  borrower: borrowingBorrowerSchema,
  startedAt: Type.String({ format: 'date-time' }),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type CreateBorrowingBodyDto = TypeExtends<
  Static<typeof createBorrowingBodyDtoSchema>,
  CreateBorrowingRequestBody
>;

export const createBorrowingResponseBodyDtoSchema = borrowingDtoSchema;

export type CreateBorrowingResponseBodyDto = TypeExtends<
  Static<typeof createBorrowingResponseBodyDtoSchema>,
  CreateBorrowingResponseBody
>;
