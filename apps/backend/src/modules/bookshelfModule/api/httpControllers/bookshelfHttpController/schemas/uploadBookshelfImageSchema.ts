import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookshelfDtoSchema } from './bookshelfDto.js';

export const uploadBookshelfImagePathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type UploadBookshelfImagePathParamsDto = TypeExtends<
  Static<typeof uploadBookshelfImagePathParamsDtoSchema>,
  contracts.UploadBookshelfImagePathParams
>;

export const uploadBookshelfImageResponseBodyDtoSchema = bookshelfDtoSchema;

export type UploadBookshelfImageResponseBodyDtoSchema = TypeExtends<
  Static<typeof uploadBookshelfImageResponseBodyDtoSchema>,
  contracts.UploadBookshelfImageResponseBody
>;
