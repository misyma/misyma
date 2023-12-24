import { type UserDomainAction } from './domainActions/userDomainAction.js';
import { UserDomainActionType } from './domainActions/userDomainActionType.js';
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

export interface UpdateFirstNamePayload {
  readonly newFirstName: string;
}

export interface UpdateLastNamePayload {
  readonly newLastName: string;
}

export interface ResetPasswordPayload {
  readonly resetPasswordToken: string;
}

export interface UpdateEmailVerificationTokenPayload {
  readonly emailVerificationToken: string;
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

  public getState(): UserDraft {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }

  public getDomainActions(): UserDomainAction[] {
    return this.domainActions;
  }

  public addUpdatePasswordAction(payload: UpdatePasswordPayload): void {
    const { newPassword } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.updatePassword,
      payload: {
        newPassword,
      },
    });

    this.password = newPassword;
  }

  public addUpdateEmailAction(payload: UpdateEmailPayload): void {
    const { newEmail } = payload;

    if (this.email === newEmail) {
      throw new OperationNotValidError({
        reason: 'The new email is the same as the old one.',
        value: newEmail,
      });
    }

    this.domainActions.push({
      actionName: UserDomainActionType.updateEmail,
      payload: {
        newEmail,
      },
    });

    this.email = newEmail;
  }

  public addUpdateFirstNameAction(payload: UpdateFirstNamePayload): void {
    const { newFirstName } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.updateFirstName,
      payload: {
        firstName: newFirstName,
      },
    });
  }

  public addUpdateLastNameAction(payload: UpdateLastNamePayload): void {
    const { newLastName } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.updateLastName,
      payload: {
        lastName: newLastName,
      },
    });
  }

  // TODO: rename to addUpdateResetPasswordTokenAction
  public addResetPasswordAction(payload: ResetPasswordPayload): void {
    const { resetPasswordToken } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.resetPassword,
      payload: {
        resetPasswordToken,
      },
    });
  }

  public addUpdateEmailVerificationTokenAction(payload: UpdateEmailVerificationTokenPayload): void {
    const { emailVerificationToken } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.updateEmailVerificationToken,
      payload: {
        emailVerificationToken,
      },
    });
  }
}
