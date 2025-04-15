import { userRoles } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

export const emailSchema = Type.String({
  format: 'email',
  maxLength: 254,
});

export const userNameSchema = Type.String({
  minLength: 1,
  maxLength: 64,
});

export const passwordSchema = Type.String({
  minLength: 8,
  maxLength: 64,
});

export const userDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: emailSchema,
  name: userNameSchema,
  isEmailVerified: Type.Boolean(),
  role: Type.Union(Object.values(userRoles).map((userRole) => Type.Literal(userRole))),
});

export type UserDto = Static<typeof userDtoSchema>;
