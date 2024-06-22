import { type BookshelfType } from './bookshelfType.js';

export interface Bookshelf {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly type: BookshelfType;
  readonly createdAt: string;
}
