import { type Bookshelf } from './bookshelf.js';

export interface UploadBookshelfImagePathParams {
  readonly bookshelfId: string;
}

export type UploadBookshelfImageResponseBody = Bookshelf;
