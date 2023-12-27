import { type ResetPasswordDomainAction } from './resetPasswordDomainAction.js';
import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdateEmailVerificationTokenDomainAction } from './updateEmailVerificationTokenDomainAction.js';
import { type UpdateFirstNameDomainAction } from './updateFirstNameDomainAction.js';
import { type UpdateLastNameDomainAction } from './updateLastNameDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';
import { type UpdateRefreshTokenDomainAction } from './updateRefreshTokenDomainAction.js';
import { type VerifyEmailDomainAction } from './verifyEmailDomainAction.js';

export type UserDomainAction =
  | UpdateEmailDomainAction
  | UpdatePasswordDomainAction
  | UpdateFirstNameDomainAction
  | UpdateLastNameDomainAction
  | ResetPasswordDomainAction
  | UpdateEmailVerificationTokenDomainAction
  | VerifyEmailDomainAction
  | UpdateRefreshTokenDomainAction;
