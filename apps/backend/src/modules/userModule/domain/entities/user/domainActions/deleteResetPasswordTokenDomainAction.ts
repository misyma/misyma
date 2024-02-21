import { type UserDomainActionType } from './userDomainActionType.js';

export interface DeleteResetPasswordTokenDomainAction {
  actionName: UserDomainActionType.deleteResetPasswordToken;
  payload: null;
}
