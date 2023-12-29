import { type BookDomainActionType } from './bookDomainActionType.js';

export interface ChangeReleaseYearDomainAction {
  readonly type: BookDomainActionType.changeReleaseYear;
  readonly payload: {
    readonly releaseYear: number;
  };
}
