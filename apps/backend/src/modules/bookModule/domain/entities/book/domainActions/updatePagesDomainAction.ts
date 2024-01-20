import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdatePagesDomainAction {
  readonly type: BookDomainActionType.updatePages;
  readonly payload: {
    readonly pages: number;
  };
}
