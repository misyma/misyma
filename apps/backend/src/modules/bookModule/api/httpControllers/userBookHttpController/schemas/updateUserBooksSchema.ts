import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateUserBooksBodyDtoSchema = Type.Object({
  data: Type.Array(
    Type.Object({
      userBookId: Type.String({ format: 'uuid' }),
      bookshelfId: Type.String({ format: 'uuid' }),
    }),
  ),
});

export type UpdateUserBooksBodyDto = TypeExtends<
  Static<typeof updateUserBooksBodyDtoSchema>,
  contracts.UpdateUserBooksRequestBody
>;

export const updateUserBooksResponseBodyDtoSchema = Type.Null();

export type UpdateUserBooksResponseBodyDto = Static<typeof updateUserBooksResponseBodyDtoSchema>;
