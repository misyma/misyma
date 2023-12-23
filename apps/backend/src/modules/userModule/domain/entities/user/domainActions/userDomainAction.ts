import { type ResetPasswordDomainAction } from './resetPasswordDomainAction.js';
import { type UpdateEmailDomainAction } from './updateEmailDomainAction.js';
import { type UpdatePasswordDomainAction } from './updatePasswordDomainAction.js';

export type UserDomainAction = UpdateEmailDomainAction | UpdatePasswordDomainAction | ResetPasswordDomainAction;
