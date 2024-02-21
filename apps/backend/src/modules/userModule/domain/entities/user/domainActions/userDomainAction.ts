import { type CreateRefreshTokenDomainAction } from './createRefreshTokenDomainAction.js';
import { type DeleteResetPasswordTokenDomainAction } from './deleteResetPasswordTokenDomainAction.js';
import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdateEmailVerificationTokenDomainAction } from './updateEmailVerificationTokenDomainAction.js';
import { type UpdateNameDomainAction } from './updateNameDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';
import { type UpdateResetPasswordTokenDomainAction } from './updateResetPasswordTokenDomainAction.js';
import { type VerifyEmailDomainAction } from './verifyEmailDomainAction.js';

export type UserDomainAction =
  | UpdateEmailDomainAction
  | UpdatePasswordDomainAction
  | UpdateNameDomainAction
  | UpdateResetPasswordTokenDomainAction
  | DeleteResetPasswordTokenDomainAction
  | UpdateEmailVerificationTokenDomainAction
  | VerifyEmailDomainAction
  | CreateRefreshTokenDomainAction;
