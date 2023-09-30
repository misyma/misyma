import { type Static, Type } from '@sinclair/typebox';

export const loginUserBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export type LoginUserBody = Static<typeof loginUserBodySchema>;

export const loginUserResponseOkBodySchema = Type.Object({
  token: Type.String(),
});

export type LoginUserResponseOkBody = Static<typeof loginUserResponseOkBodySchema>;
