import { type DeleteCategoryPathParams } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteCategoryPathParamsDtoSchema = Type.Object({
  categoryId: Type.String({ format: 'uuid' }),
});

export type DeleteCategoryPathParamsDto = TypeExtends<
  DeleteCategoryPathParams,
  Static<typeof deleteCategoryPathParamsDtoSchema>
>;

export const deleteCategoryResponseBodyDtoSchema = Type.Null();

export type DeleteCategoryResponseBodyDto = Static<typeof deleteCategoryResponseBodyDtoSchema>;
