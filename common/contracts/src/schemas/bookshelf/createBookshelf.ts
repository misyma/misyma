import { type Bookshelf } from './bookshelf.js';

export interface CreateBookshelfRequestBody {
  readonly name: string;
  readonly address?: string;
  readonly imageUrl?: string;
}

export interface CreateBookshelfResponseBody extends Bookshelf {}
