import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDtoSchema, authorNameSchema } from '../../common/authorDto.js';

export const updateAuthorPathParamsDtoSchema = Type.Object({
  authorId: Type.String({ format: 'uuid' }),
});

export type UpdateAuthorPathParamsDto = TypeExtends<
  contracts.UpdateAuthorPathParams,
  Static<typeof updateAuthorPathParamsDtoSchema>
>;

export const updateAuthorBodyDtoSchema = Type.Object({
  name: Type.Optional(authorNameSchema),
  isApproved: Type.Optional(Type.Boolean()),
});

export type UpdateAuthorBodyDto = TypeExtends<
  contracts.UpdateAuthorRequestBody,
  Static<typeof updateAuthorBodyDtoSchema>
>;

export const updateAuthorResponseBodyDtoSchema = authorDtoSchema;

export type UpdateAuthorResponseBodyDto = TypeExtends<
  contracts.UpdateAuthorResponseBody,
  Static<typeof updateAuthorResponseBodyDtoSchema>
>;
