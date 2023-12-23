import { type UserActionType } from './userDomainActionType.js';

export interface UpdatePasswordDomainAction {
  actionName: UserActionType.updatePassword;
  payload: {
    newPassword: string;
  };
}
