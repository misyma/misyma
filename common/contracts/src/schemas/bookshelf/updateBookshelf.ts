import { type Bookshelf } from './bookshelf.js';

export interface UpdateBookshelfRequestBody {
  readonly name: string;
}

export interface UpdateBookshelfPathParams {
  readonly bookshelfId: string;
}

export interface UpdateBookshelfResponseBody extends Bookshelf {}
