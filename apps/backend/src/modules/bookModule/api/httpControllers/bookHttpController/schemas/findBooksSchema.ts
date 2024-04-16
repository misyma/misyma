import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookDTOSchema } from '../../common/bookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBooksQueryParamsDTOSchema = Type.Object({
  isbn: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
});

export type FindBooksQueryParamsDTO = TypeExtends<
  Static<typeof findBooksQueryParamsDTOSchema>,
  contracts.FindBooksQueryParams
>;

export const findBooksResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookDTOSchema),
});

export type FindBooksResponseBodyDTO = TypeExtends<
  contracts.FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDTOSchema>
>;
