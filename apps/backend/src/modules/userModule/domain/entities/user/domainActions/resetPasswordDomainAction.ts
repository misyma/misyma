import { type UserActionType } from './userDomainActionType.js';

export interface ResetPasswordDomainAction {
  actionName: UserActionType.resetPassword;
  payload: {
    resetPasswordToken: string;
  };
}
