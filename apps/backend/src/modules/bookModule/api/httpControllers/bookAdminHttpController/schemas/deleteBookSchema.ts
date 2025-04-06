import { type DeleteBookPathParams } from '@common/contracts';
import { Type, type Static } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBookPathParamsDtoSchema = Type.Object({ bookId: Type.String({ format: 'uuid' }) });

export type DeleteBookPathParamsDto = TypeExtends<Static<typeof deleteBookPathParamsDtoSchema>, DeleteBookPathParams>;

export const deleteBookResponseBodyDtoSchema = Type.Null();

export type DeleteBookResponseBodyDto = Static<typeof deleteBookResponseBodyDtoSchema>;
