import { type BookFormat } from '@common/contracts';

import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateFormatDomainAction {
  readonly type: BookDomainActionType.updateFormat;
  readonly payload: {
    readonly format: BookFormat;
  };
}
