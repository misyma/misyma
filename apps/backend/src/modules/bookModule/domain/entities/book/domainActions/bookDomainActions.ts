import { type AddAuthorDomainAction } from './addAuthorDomainAction.js';
import { type ChangeReleaseYearDomainAction } from './changeReleaseYear.js';
import { type ChangeTitleDomainAction } from './changeTitleDomainAction.js';
import { type DeleteAuthorDomainAction } from './deleteAuthorDomainAction.js';

export type BookDomainAction =
  | AddAuthorDomainAction
  | DeleteAuthorDomainAction
  | ChangeReleaseYearDomainAction
  | ChangeTitleDomainAction;
