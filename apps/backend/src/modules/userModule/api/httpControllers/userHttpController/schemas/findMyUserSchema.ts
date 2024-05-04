import { type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userDtoSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findMyUserResponseBodyDtoSchema = userDtoSchema;

export type FindMyUserResponseBodyDto = TypeExtends<
  Static<typeof findMyUserResponseBodyDtoSchema>,
  contracts.FindMyUserResponseBody
>;
