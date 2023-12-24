import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateEmailVerificationTokenDomainAction {
  actionName: UserDomainActionType.updateEmailVerificationToken;
  payload: {
    emailVerificationToken: string;
  };
}
