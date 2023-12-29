import { type BookDomainActionType } from './bookDomainActionType.js';

export interface ChangeTitleDomainAction {
  readonly type: BookDomainActionType.changeTitle;
  readonly payload: {
    readonly title: string;
  };
}
