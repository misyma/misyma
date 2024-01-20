import { type BookDomainActionType } from './bookDomainActionType.js';

export interface UpdateReleaseYearDomainAction {
  readonly type: BookDomainActionType.updateReleaseYear;
  readonly payload: {
    readonly releaseYear: number;
  };
}
