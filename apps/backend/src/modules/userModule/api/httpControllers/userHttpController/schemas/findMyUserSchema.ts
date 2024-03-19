import { type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userDTOSchema } from './userDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findMyUserResponseBodyDTOSchema = userDTOSchema;

export type FindMyUserResponseBodyDTO = TypeExtends<
  Static<typeof findMyUserResponseBodyDTOSchema>,
  contracts.FindMyUserResponseBody
>;
