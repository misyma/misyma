import { type Static, Type } from '@sinclair/typebox';

export const categoryNameSchema = Type.String({
  minLength: 1,
  maxLength: 64,
});

export const categoryDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: categoryNameSchema,
});

export type CategoryDto = Static<typeof categoryDtoSchema>;
