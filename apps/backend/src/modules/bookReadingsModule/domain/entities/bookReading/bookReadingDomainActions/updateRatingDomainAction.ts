import { type BookReadingDomainActionType } from './bookReadingDomainActionType.js';

export interface UpdateRatingDomainAction {
  actionName: BookReadingDomainActionType.updateRating;
  payload: {
    rating: number;
  };
}
