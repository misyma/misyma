import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdatePublisherDomainAction {
  readonly type: BookDomainActionType.updatePublisher;
  readonly payload: {
    readonly publisher: string;
  };
}
