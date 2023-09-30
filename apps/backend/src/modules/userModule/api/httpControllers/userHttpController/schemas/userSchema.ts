import { Type } from '@sinclair/typebox';

export const userSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
});
