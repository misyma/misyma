import { type DeleteBookReadingPathParams } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookReadingPathParamsDtoSchema = Type.Object({
  readingId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type DeleteBookReadingPathParamsDto = TypeExtends<
  Static<typeof deleteBookReadingPathParamsDtoSchema>,
  DeleteBookReadingPathParams
>;

export const deleteBookReadingResponseBodyDtoSchema = Type.Null();

export type DeleteBookReadingResponseBodyDto = Static<typeof deleteBookReadingResponseBodyDtoSchema>;
