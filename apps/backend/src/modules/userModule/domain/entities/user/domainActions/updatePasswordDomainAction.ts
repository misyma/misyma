import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdatePasswordDomainAction {
  actionName: UserDomainActionType.updatePassword;
  payload: {
    newPassword: string;
  };
}
