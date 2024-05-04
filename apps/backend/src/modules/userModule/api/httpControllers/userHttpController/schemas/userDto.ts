import { type Static, Type } from '@sinclair/typebox';

import { UserRole } from '@common/contracts';

export const userDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({
    format: 'email',
    maxLength: 254,
  }),
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  isEmailVerified: Type.Boolean(),
  role: Type.Enum(UserRole),
});

export type UserDto = Static<typeof userDtoSchema>;
