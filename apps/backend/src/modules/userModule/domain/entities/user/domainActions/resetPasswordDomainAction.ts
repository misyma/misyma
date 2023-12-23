import { type UserDomainActionType } from './userDomainActionType.js';

export interface ResetPasswordDomainAction {
  actionName: UserDomainActionType.resetPassword;
  payload: {
    resetPasswordToken: string;
  };
}
