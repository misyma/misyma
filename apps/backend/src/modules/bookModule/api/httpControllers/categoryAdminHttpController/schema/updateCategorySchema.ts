import {
  type UpdateCategoryPathParams,
  type UpdateCategoryRequestBody,
  type UpdateCategoryResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { categoryDtoSchema, categoryNameSchema } from '../../common/categoryDto.js';

export const updateCategoryPathParamsDtoSchema = Type.Object({
  categoryId: Type.String({ format: 'uuid' }),
});

export type UpdateCategoryPathParamsDto = TypeExtends<
  UpdateCategoryPathParams,
  Static<typeof updateCategoryPathParamsDtoSchema>
>;

export const updateCategoryBodyDtoSchema = Type.Object({
  name: categoryNameSchema,
});

export type UpdateCategoryBodyDto = TypeExtends<UpdateCategoryRequestBody, Static<typeof updateCategoryBodyDtoSchema>>;

export const updateCategoryResponseBodyDtoSchema = categoryDtoSchema;

export type UpdateCategoryResponseBodyDto = TypeExtends<
  UpdateCategoryResponseBody,
  Static<typeof updateCategoryResponseBodyDtoSchema>
>;
