import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateBookReadingNamePathParamsDTOSchema = Type.Object({
  bookReadingId: Type.String({
    format: 'uuid',
  }),
});

export type UpdateBookReadingNamePathParamsDTO = TypeExtends<
  Static<typeof updateBookReadingNamePathParamsDTOSchema>,
  contracts.UpdateBookReadingNamePathParams
>;

export const updateBookReadingNameBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
  }),
});

export type UpdateBookReadingNameBodyDTO = TypeExtends<
  Static<typeof updateBookReadingNameBodyDTOSchema>,
  contracts.UpdateBookReadingNameBody
>;

export const updateBookReadingNameOkResponseBodyDTOSchema = Type.Object({
  bookReading: bookReadingDTOSchema,
});

export type UpdateBookReadingNameOkResponseBodyDTO = TypeExtends<
  Static<typeof updateBookReadingNameOkResponseBodyDTOSchema>,
  contracts.UpdateBookReadingNameResponseBody
>;
