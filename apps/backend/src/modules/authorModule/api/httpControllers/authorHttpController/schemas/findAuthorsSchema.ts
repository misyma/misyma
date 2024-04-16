import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDTOSchema } from '../../common/authorDto.js';

export const findAuthorsQueryParamsDTOSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
});

export type FindAuthorsQueryParamsDTO = TypeExtends<
  Static<typeof findAuthorsQueryParamsDTOSchema>,
  contracts.FindAuthorsQueryParams
>;

export const findAuthorsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(authorDTOSchema),
});

export type FindAuthorsResponseBodyDTO = TypeExtends<
  Static<typeof findAuthorsResponseBodyDTOSchema>,
  contracts.FindAuthorsResponseBody
>;
