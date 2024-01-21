import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateBookshelfDomainAction {
  readonly type: BookDomainActionType.updateBookshelf;
  readonly payload: {
    readonly bookshelfId: string;
  };
}
