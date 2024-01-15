import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findMyUserResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  isEmailVerified: Type.Boolean(),
});

export type FindMyUserResponseBodyDTO = TypeExtends<
  Static<typeof findMyUserResponseBodyDTOSchema>,
  contracts.FindMyUserResponseBody
>;
