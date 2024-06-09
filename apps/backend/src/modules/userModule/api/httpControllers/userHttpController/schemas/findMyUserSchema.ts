import { type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDtoSchema } from '../../common/userDto.js';

export const findMyUserResponseBodyDtoSchema = userDtoSchema;

export type FindMyUserResponseBodyDto = TypeExtends<
  Static<typeof findMyUserResponseBodyDtoSchema>,
  contracts.FindMyUserResponseBody
>;
