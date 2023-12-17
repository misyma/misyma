import { type Page, expect } from '@playwright/test';

import { HttpStatusCode } from '../../../backend/src/common/types/http/httpStatusCode.js';
import { E2ETestConfigProvider } from '../config/e2eTestConfigProvider.js';
import { MockResponse } from '../mocks/mockResponse.js';
import { type UserApiMocksService } from '../mocks/userApiMocksService.js';

export interface MockLoginRequestPayload {
  accessToken: string;
  refreshToken: string;
}

export class LoginPage {
  private loginPage!: Page;

  public constructor(private readonly userApiMocksService: UserApiMocksService) {}

  public async visit(page: Page): Promise<void> {
    const appBaseUrl = E2ETestConfigProvider.getApplicationUrl();

    this.loginPage = page;

    await this.loginPage.goto(appBaseUrl);
  }

  public async fillUserEmail(email: string): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    await this.loginPage.getByPlaceholder('Email address').fill(email);
  }

  public async fillUserPassword(password: string): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    await this.loginPage.getByPlaceholder('Password').fill(password);
  }

  public async pressLogin(): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    await this.loginPage.getByRole('button', { name: 'Login' }).click();
  }

  public async checkFormError(): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    const formError = this.loginPage.getByText('Password or email invalid. Try again.');

    expect(formError).toBeInViewport();
  }

  public async checkPasswordError(): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    const passwordError = this.loginPage.getByText('Password too short - 8 characters required.');

    expect(await passwordError.isVisible()).toBeTruthy();
  }

  public async checkEmailError(): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    const emailError = this.loginPage.getByText('Invalid email address.');

    expect(await emailError.isVisible()).toBeTruthy();
  }

  public async checkNoErrors(): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    const emailError = this.loginPage.getByText('Invalid email address.');

    const passwordError = this.loginPage.getByText('Password too short - 8 characters required.');

    const formError = this.loginPage.getByText('Password or email invalid. Try again.');

    expect(await emailError.isVisible()).toBeFalsy();

    expect(await passwordError.isVisible()).toBeFalsy();

    expect(await formError.isVisible()).toBeFalsy();
  }

  public async mockLoginRequest(payload: MockLoginRequestPayload): Promise<void> {
    this.verifyPageIsVisited(this.loginPage);

    const { accessToken, refreshToken } = payload;

    await this.userApiMocksService.mockUserLogin({
      page: this.loginPage,
      response: new MockResponse(HttpStatusCode.created, {
        accessToken,
        refreshToken,
      }),
    });
  }

  private verifyPageIsVisited(page: Page | undefined): page is Page {
    if (this.loginPage?.url() !== E2ETestConfigProvider.getApplicationUrl()) {
      throw new Error('Page is not visited.');
    }

    return true;
  }
}
