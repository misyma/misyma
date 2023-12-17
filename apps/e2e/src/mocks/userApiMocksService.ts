import { type Page } from '@playwright/test';

import { E2ETestConfigProvider } from '../config/e2eTestConfigProvider.js';

interface MockUserLoginPayload {
  page: Page;
  accessToken: string;
  refreshToken: string;
}

interface MockUserRegistrationPayload {
  page: Page;
}

export class UserApiMocksService {
  private mocksEnabled = E2ETestConfigProvider.areMocksEnabled();

  private userApiSettings = E2ETestConfigProvider.getUserApiSettings();

  public async mockUserLogin(payload: MockUserLoginPayload): Promise<void> {
    const { page, accessToken, refreshToken } = payload;

    if (!this.mocksEnabled) {
      return;
    }

    await page.route(new RegExp(this.userApiSettings.login.url), (route) => {
      const requestBody = route.request().postData();

      if (!requestBody) {
        // TODO: We can just pass our error messages here in the body
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: 'Unauthorized.',
        });

        return;
      }

      const { email, password } = JSON.parse(requestBody);

      if (
        email !== E2ETestConfigProvider.getTestUserEmail() ||
        password !== E2ETestConfigProvider.getTestUserPassword()
      ) {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: 'Unauthorized.',
        });

        return;
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken,
          refreshToken,
        }),
      });
    });
  }

  public async mockUserRegistration(payload: MockUserRegistrationPayload): Promise<void> {
    const { page } = payload;

    if (!this.mocksEnabled) {
      return;
    }

    await page.route(new RegExp(this.userApiSettings.register.url), (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
      });
    });
  }
}
