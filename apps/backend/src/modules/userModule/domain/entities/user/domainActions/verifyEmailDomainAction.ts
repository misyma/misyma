import { type UserDomainActionType } from './userDomainActionType.js';

export interface VerifyEmailDomainAction {
  actionName: UserDomainActionType.verifyEmail;
}
