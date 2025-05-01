import { type CreateCategoryRequestBody, type CreateCategoryResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { categoryDtoSchema, categoryNameSchema } from '../../common/categoryDto.js';

export const createCategoryBodyDtoSchema = Type.Object({
  name: categoryNameSchema,
});

export type CreateCategoryBodyDto = TypeExtends<CreateCategoryRequestBody, Static<typeof createCategoryBodyDtoSchema>>;

export const createCategoryResponseBodyDtoSchema = categoryDtoSchema;

export type CreateCategoryResponseBodyDto = TypeExtends<
  CreateCategoryResponseBody,
  Static<typeof createCategoryResponseBodyDtoSchema>
>;
