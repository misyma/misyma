import { type BookshelfDomainActionType } from './bookshelfDomainActionType.js';

export interface UpdateAddressIdBookshelfDomainAction {
  actionName: BookshelfDomainActionType.updateAddressId;
  payload: {
    addressId: string | undefined;
  };
}
