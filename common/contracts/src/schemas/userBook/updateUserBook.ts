import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';

export interface UpdateUserBookPathParams {
  readonly userBookId: string;
}

export interface UpdateUserBookRequestBody {
  readonly imageUlr?: string;
  readonly status?: ReadingStatus;
  readonly bookshelfId?: string;
}

export type UpdateUserBookResponseBody = UserBook;
