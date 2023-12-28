import { type AddAuthorDomainAction } from './addAuthorDomainAction.js';
import { type DeleteAuthorDomainAction } from './deleteAuthorDomainAction.js';

export type BookDomainAction = AddAuthorDomainAction | DeleteAuthorDomainAction;
