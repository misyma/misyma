import { type ResetPasswordDomainAction } from './resetPasswordDomainAction.js';
import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdateFirstNameDomainAction } from './updateFirstNameDomainAction.js';
import { type UpdateLastNameDomainAction } from './updateLastNameDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';

export type UserDomainAction =
  | UpdateEmailDomainAction
  | UpdatePasswordDomainAction
  | UpdateFirstNameDomainAction
  | UpdateLastNameDomainAction
  | ResetPasswordDomainAction;
