import { type BookReadingDomainActionType } from './bookReadingDomainActionType.js';

export interface UpdateCommentDomainAction {
  actionName: BookReadingDomainActionType.updateComment;
  payload: {
    comment: string;
  };
}
