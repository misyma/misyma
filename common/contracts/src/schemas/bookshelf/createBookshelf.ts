import { type Bookshelf } from './bookshelf.js';

export interface CreateBookshelfRequestBody {
  readonly name: string;
}

export interface CreateBookshelfResponseBody extends Bookshelf {}
