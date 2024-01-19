import { type BookshelfDomainActionType } from './bookshelfDomainActionType.js';

export interface UpdateNameBookshelfDomainAction {
  actionName: BookshelfDomainActionType.updateName;
  payload: {
    name: string;
  };
}
