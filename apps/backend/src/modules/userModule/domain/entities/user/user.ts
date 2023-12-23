import { type UserDomainAction } from './domainActions/userDomainAction.js';
import { UserActionType } from './domainActions/userDomainActionType.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';

export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface UpdatePasswordPayload {
  readonly newPassword: string;
}

export interface UpdateEmailPayload {
  readonly newEmail: string;
}

export interface ResetPasswordPayload {
  readonly resetPasswordToken: string;
}

export class User {
  private id: string;
  private email: string;
  private password: string;
  private firstName: string;
  private lastName: string;
  private domainActions: UserDomainAction[] = [];

  public constructor(draft: UserDraft) {
    const { id, email, password, firstName, lastName } = draft;

    this.id = id;

    this.password = password;

    this.email = email;

    this.firstName = firstName;

    this.lastName = lastName;
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getDomainActions(): UserDomainAction[] {
    return this.domainActions;
  }

  public updatePassword(payload: UpdatePasswordPayload): void {
    const { newPassword } = payload;

    this.domainActions.push({
      actionName: UserActionType.updatePassword,
      payload: {
        newPassword,
      },
    });

    this.password = newPassword;
  }

  public updateEmail(payload: UpdateEmailPayload): void {
    const { newEmail } = payload;

    if (this.email === newEmail) {
      throw new OperationNotValidError({
        reason: 'The new email is the same as the old one.',
        value: newEmail,
      });
    }

    this.domainActions.push({
      actionName: UserActionType.updateEmail,
      payload: {
        newEmail,
      },
    });

    this.email = newEmail;
  }

  public resetPassword(payload: ResetPasswordPayload): void {
    const { resetPasswordToken } = payload;

    this.domainActions.push({
      actionName: UserActionType.resetPassword,
      payload: {
        resetPasswordToken,
      },
    });
  }
}
