import { type BookReadingDomainActionType } from './bookReadingDomainActionType.js';

export interface UpdateEndedDateDomainAction {
  actionName: BookReadingDomainActionType.updateEndedDate;
  payload: {
    endedAt: Date;
  };
}
