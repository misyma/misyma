import { Page } from '@playwright/test';

interface MockUserLoginPayload {
  page: Page;
  acceptEmail: string;
  acceptPassword: string;
}

interface MockUserRegistrationPayload {
  page: Page;
}

export async function mockUserLogin(payload: MockUserLoginPayload): Promise<void> {
  const { acceptEmail, acceptPassword, page } = payload;

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

export async function mockUserRegistration(payload: MockUserRegistrationPayload): Promise<void> {
  const { page } = payload;

  await page.route('/api/user/register', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
    });
  });
}
