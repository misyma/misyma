import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const uploadUserBookImagePathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UploadUserBookImagePathParamsDTO = TypeExtends<
  Static<typeof uploadUserBookImagePathParamsDTOSchema>,
  contracts.UploadUserBookImagePathParams
>;

export const uploadUserBookImageResponseDTOSchema = userBookDTOSchema;

export type UploadUserBookImageResponseDTOSchema = TypeExtends<
  Static<typeof uploadUserBookImageResponseDTOSchema>,
  contracts.UploadUserBookImageResponseBody
>;
