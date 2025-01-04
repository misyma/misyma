import { type ReadingStatus } from './readingStatus.js';
import { type UserBook } from './userBook.js';

export interface CreateUserBookRequestBody {
  readonly bookId: string;
  readonly bookshelfId: string;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly imageUrl?: string;
  readonly genreId: string;
  readonly collectionIds?: string[];
}

export interface CreateUserBookResponseBody extends UserBook {}
