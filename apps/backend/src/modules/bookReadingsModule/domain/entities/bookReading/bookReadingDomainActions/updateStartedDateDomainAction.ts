import { type BookReadingDomainActionType } from './bookReadingDomainActionType.js';

export interface UpdateStartedDateDomainAction {
  actionName: BookReadingDomainActionType.updateStartedDate;
  payload: {
    startedAt: Date;
  };
}
