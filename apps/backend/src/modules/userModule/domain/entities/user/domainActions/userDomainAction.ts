import { type CreateRefreshTokenDomainAction } from './createRefreshTokenDomainAction.js';
import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdateEmailVerificationTokenDomainAction } from './updateEmailVerificationTokenDomainAction.js';
import { type UpdateFirstNameDomainAction } from './updateFirstNameDomainAction.js';
import { type UpdateLastNameDomainAction } from './updateLastNameDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';
import { type UpdateResetPasswordTokenDomainAction } from './updateResetPasswordTokenDomainAction.js';
import { type VerifyEmailDomainAction } from './verifyEmailDomainAction.js';

export type UserDomainAction =
  | UpdateEmailDomainAction
  | UpdatePasswordDomainAction
  | UpdateFirstNameDomainAction
  | UpdateLastNameDomainAction
  | UpdateResetPasswordTokenDomainAction
  | UpdateEmailVerificationTokenDomainAction
  | VerifyEmailDomainAction
  | CreateRefreshTokenDomainAction;
