import { type BookStatus } from '@common/contracts';

import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateStatusDomainAction {
  readonly type: BookDomainActionType.updateStatus;
  readonly payload: {
    readonly status: BookStatus;
  };
}
