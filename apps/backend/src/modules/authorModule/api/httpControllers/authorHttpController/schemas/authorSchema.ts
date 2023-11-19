import { Type } from '@sinclair/typebox';

export const authorSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});
