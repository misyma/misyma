import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const uploadUserBookImagePathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UploadUserBookImagePathParamsDto = TypeExtends<
  Static<typeof uploadUserBookImagePathParamsDtoSchema>,
  contracts.UploadUserBookImagePathParams
>;

export const uploadUserBookImageResponseBodyDtoSchema = userBookDtoSchema;

export type UploadUserBookImageResponseBodyDtoSchema = TypeExtends<
  Static<typeof uploadUserBookImageResponseBodyDtoSchema>,
  contracts.UploadUserBookImageResponseBody
>;
