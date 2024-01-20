import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateIsbnDomainAction {
  readonly type: BookDomainActionType.updateIsbn;
  readonly payload: {
    readonly isbn: string;
  };
}
