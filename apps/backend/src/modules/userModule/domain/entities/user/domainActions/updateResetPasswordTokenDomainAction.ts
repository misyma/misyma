import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateResetPasswordTokenDomainAction {
  actionName: UserDomainActionType.updateResetPasswordToken;
  payload: {
    token: string;
    expiresAt: Date;
  };
}
