import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateBackCoverImageUrlDomainAction {
  readonly type: BookDomainActionType.updateBackCoverImageUrl;
  readonly payload: {
    readonly backCoverImageUrl: string;
  };
}
