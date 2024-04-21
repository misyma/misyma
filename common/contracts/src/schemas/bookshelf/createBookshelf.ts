import { type Bookshelf } from './bookshelf.js';

export interface CreateBookshelfRequestBody {
  readonly name: string;
  readonly userId: string;
}

export interface CreateBookshelfResponseBody extends Bookshelf {}
