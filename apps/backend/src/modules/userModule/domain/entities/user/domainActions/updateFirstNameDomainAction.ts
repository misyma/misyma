import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateFirstNameDomainAction {
  actionName: UserDomainActionType.updateFirstName;
  payload: {
    firstName: string;
  };
}
