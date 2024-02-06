import { type UpdateCommentDomainAction } from './updateCommentDomainAction.js';
import { type UpdateEndedDateDomainAction } from './updateEndedDateDomainAction.js';
import { type UpdateRatingDomainAction } from './updateRatingDomainAction.js';
import { type UpdateStartedDateDomainAction } from './updateStartedDateDomainAction.js';

export type BookReadingDomainAction =
  | UpdateCommentDomainAction
  | UpdateRatingDomainAction
  | UpdateEndedDateDomainAction
  | UpdateStartedDateDomainAction;
