import { type Bookshelf } from './bookshelf.js';

export interface UpdateBookshelfNameRequestBody {
  readonly name: string;
}

export interface UpdateBookshelfNamePathParams {
  readonly bookshelfId: string;
}

export interface UpdateBookshelfNameResponseBody {
  readonly bookshelf: Bookshelf;
}
