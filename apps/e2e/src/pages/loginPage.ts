import { type Page, expect } from '@playwright/test';

export class LoginPage {
  public constructor(private readonly page: Page) {}

  public async fillUserEmail(email: string): Promise<void> {
    await this.page.getByPlaceholder('Email address').fill(email);
  }

  public async fillUserPassword(password: string): Promise<void> {
    await this.page.getByPlaceholder('Password').fill(password);
  }

  public async pressLogin(): Promise<void> {
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  public async checkFormError(): Promise<void> {
    const formError = this.page.getByText('Password or email invalid. Try again.');

    expect(formError).toBeInViewport();
  }

  public async checkPasswordError(): Promise<void> {
    const passwordError = this.page.getByText('Password too short - 8 characters required.');

    await passwordError.click();

    expect(passwordError).toBeInViewport();
  }

  public async checkEmailError(): Promise<void> {
    const emailError = this.page.getByText('Invalid email address.');

    expect(await emailError.isVisible()).toBeTruthy();
  }

  public async checkNoErrors(): Promise<void> {
    const emailError = this.page.getByText('Invalid email address.');

    const passwordError = this.page.getByText('Password too short - 8 characters required.');

    const formError = this.page.getByText('Password or email invalid. Try again.');

    expect(await emailError.isVisible()).toBeFalsy();

    expect(await passwordError.isVisible()).toBeFalsy();

    expect(await formError.isVisible()).toBeFalsy();
  }
}
