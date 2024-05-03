import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookReadingPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookReadingPathParamsDTO = TypeExtends<
  Static<typeof updateBookReadingPathParamsDTOSchema>,
  contracts.UpdateBookReadingPathParams
>;

export const updateBookReadingBodyDTOSchema = Type.Object({
  comment: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
  rating: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 10,
    }),
  ),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  endedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export type UpdateBookReadingBodyDTO = TypeExtends<
  Static<typeof updateBookReadingBodyDTOSchema>,
  contracts.UpdateBookReadingRequestBody
>;

export const updateBookReadingResponseBodyDTOSchema = bookReadingDTOSchema;

export type UpdateBookReadingResponseBodyDTO = TypeExtends<
  Static<typeof updateBookReadingResponseBodyDTOSchema>,
  contracts.UpdateBookReadingResponseBody
>;
