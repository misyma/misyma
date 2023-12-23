import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateEmailDomainAction {
  actionName: UserDomainActionType.updateEmail;
  payload: {
    newEmail: string;
  };
}
