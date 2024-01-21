import { type UpdateAddressIdBookshelfDomainAction } from './updateAddressIdBookshelfDomainAction.js';
import { type UpdateNameBookshelfDomainAction } from './updateNameBookshelfDomainAction.js';

export type BookshelfDomainAction = UpdateNameBookshelfDomainAction | UpdateAddressIdBookshelfDomainAction;
