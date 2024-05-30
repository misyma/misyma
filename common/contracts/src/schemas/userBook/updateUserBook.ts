import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';

export interface UpdateUserBookPathParams {
  readonly userBookId: string;
}

export interface UpdateUserBookRequestBody {
  readonly imageUrl?: string | null;
  readonly status?: ReadingStatus;
  readonly isFavorite?: boolean;
  readonly bookshelfId?: string;
  readonly genreIds?: string[];
}

export type UpdateUserBookResponseBody = UserBook;
