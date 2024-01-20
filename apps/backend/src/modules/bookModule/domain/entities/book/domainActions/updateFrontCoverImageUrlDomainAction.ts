import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateFrontCoverImageUrlDomainAction {
  readonly type: BookDomainActionType.updateFrontCoverImageUrl;
  readonly payload: {
    readonly frontCoverImageUrl: string;
  };
}
