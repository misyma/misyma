import { type UploadUserBookImagePathParams, type UploadUserBookImageResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { userBookDtoSchema } from './userBookDto.js';

export const uploadUserBookImagePathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type UploadUserBookImagePathParamsDto = TypeExtends<
  Static<typeof uploadUserBookImagePathParamsDtoSchema>,
  UploadUserBookImagePathParams
>;

export const uploadUserBookImageResponseBodyDtoSchema = userBookDtoSchema;

export type UploadUserBookImageResponseBodyDtoSchema = TypeExtends<
  Static<typeof uploadUserBookImageResponseBodyDtoSchema>,
  UploadUserBookImageResponseBody
>;
