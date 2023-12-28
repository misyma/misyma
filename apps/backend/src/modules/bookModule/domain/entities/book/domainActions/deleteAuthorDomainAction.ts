import { type BookDomainActionType } from './bookDomainActionType.js';

export interface DeleteAuthorDomainAction {
  type: BookDomainActionType.deleteAuthor;
  payload: {
    authorId: string;
  };
}
