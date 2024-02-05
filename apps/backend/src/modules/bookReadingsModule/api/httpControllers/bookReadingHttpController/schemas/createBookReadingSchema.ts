import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './dtos/bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBookReadingBodyDTOSchema = Type.Object({
  name: Type.String(),
  userId: Type.String(),
  addressId: Type.Optional(Type.String()),
});

export type CreateBookReadingBodyDTO = TypeExtends<
  Static<typeof createBookReadingBodyDTOSchema>,
  contracts.CreateBookReadingBody
>;

export const createBookReadingResponseBodyDTOSchema = Type.Object({
  bookReading: bookReadingDTOSchema,
});

export type CreateBookReadingResponseBodyDTO = TypeExtends<
  Static<typeof createBookReadingResponseBodyDTOSchema>,
  contracts.CreateBookReadingResponseBody
>;
