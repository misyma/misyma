import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelfByIdPathParamsDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
});

export type FindBookshelfByIdPathParamsDTO = TypeExtends<
  Static<typeof findBookshelfByIdPathParamsDTOSchema>,
  contracts.FindBookshelfByIdParams
>;

export const findBookshelfByIdOkResponseBodyDTOSchema = Type.Object({
  bookshelf: bookshelfDTOSchema,
});

export type FindBookshelfByIdOkResponseBodyDTO = TypeExtends<
  Static<typeof findBookshelfByIdOkResponseBodyDTOSchema>,
  contracts.FindBookshelfByIdResponseBody
>;
