import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { quoteDtoSchema } from './quoteDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateQuotePathParamsDtoSchema = Type.Object({
  quoteId: Type.String({ format: 'uuid' }),
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateQuotePathParamsDto = TypeExtends<
  Static<typeof updateQuotePathParamsDtoSchema>,
  contracts.UpdateQuotePathParams
>;

export const updateQuoteBodyDtoSchema = Type.Object({
  content: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
  isFavorite: Type.Optional(Type.Boolean()),
  page: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
});

export type UpdateQuoteBodyDto = TypeExtends<Static<typeof updateQuoteBodyDtoSchema>, contracts.UpdateQuoteRequestBody>;

export const updateQuoteResponseBodyDtoSchema = quoteDtoSchema;

export type UpdateQuoteResponseBodyDto = TypeExtends<
  Static<typeof updateQuoteResponseBodyDtoSchema>,
  contracts.UpdateQuoteResponseBody
>;
