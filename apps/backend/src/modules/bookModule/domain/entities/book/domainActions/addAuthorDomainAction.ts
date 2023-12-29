import { type BookDomainActionType } from './bookDomainActionType.js';

export interface AddAuthorDomainAction {
  type: BookDomainActionType.addAuthor;
  payload: {
    authorId: string;
  };
}
