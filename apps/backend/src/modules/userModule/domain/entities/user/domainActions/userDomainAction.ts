import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdateNameDomainAction } from './updateNameDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';
import { type VerifyEmailDomainAction } from './verifyEmailDomainAction.js';

export type UserDomainAction =
  | UpdateEmailDomainAction
  | UpdatePasswordDomainAction
  | UpdateNameDomainAction
  | VerifyEmailDomainAction;
