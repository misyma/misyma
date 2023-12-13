import { type Page } from '@playwright/test';
import config from 'config';

interface MockUserLoginPayload {
  page: Page;
  acceptEmail: string;
  acceptPassword: string;
}

interface MockUserRegistrationPayload {
  page: Page;
}

export class UserApiMocksService {
  private useMocks = config.get<boolean>('useMocks');

  public async mockUserLogin(payload: MockUserLoginPayload): Promise<void> {
    const { acceptEmail, acceptPassword, page } = payload;

    if (!this.useMocks) {
      return;
    }

    // TODO: Replace with real endpoint
    await page.route(new RegExp(/(api\/user\/login)$/), (route) => {
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

      if (email !== acceptEmail || password !== acceptPassword) {
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
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        }),
      });
    });
  }

  public async mockUserRegistration(payload: MockUserRegistrationPayload): Promise<void> {
    const { page } = payload;

    if (!this.useMocks) {
      return;
    }

    await page.route('/api/user/register', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
      });
    });
  }
}
