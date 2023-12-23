import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateLastNameDomainAction {
  actionName: UserDomainActionType.updateLastName;
  payload: {
    lastName: string;
  };
}
