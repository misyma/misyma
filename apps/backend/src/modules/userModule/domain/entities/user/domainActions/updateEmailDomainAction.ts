import { type UserActionType } from './userDomainActionType.js';

export interface UpdateEmailDomainAction {
  actionName: UserActionType.updateEmail;
  payload: {
    newEmail: string;
  };
}
