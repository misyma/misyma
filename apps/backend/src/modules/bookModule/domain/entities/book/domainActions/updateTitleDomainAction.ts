import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateTitleDomainAction {
  readonly type: BookDomainActionType.updateTitle;
  readonly payload: {
    readonly title: string;
  };
}
