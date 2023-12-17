import { test } from '@playwright/test';

import { E2ETestConfigProvider } from '../config/e2eTestConfigProvider.js';
import { UserApiMocksService } from '../mocks/userApiMocksService.js';
import { LoginPage } from '../pages/loginPage.js';

const userApiMocksService = new UserApiMocksService();

test('shows an error - when email is invalid', async ({ page }) => {
  const loginPage = new LoginPage(userApiMocksService);

  await loginPage.visit(page);

  await loginPage.fillUserEmail('invalid');

  await loginPage.checkEmailError();
});

test('shows an error - when password is invalid', async ({ page }) => {
  const loginPage = new LoginPage(userApiMocksService);

  await loginPage.visit(page);

  await loginPage.fillUserPassword('shortie');

  await loginPage.checkPasswordError();
});

test('login handled successfully', async ({ page }) => {
  const loginPage = new LoginPage(userApiMocksService);

  await loginPage.visit(page);

  const email = E2ETestConfigProvider.getTestUserEmail();

  const password = E2ETestConfigProvider.getTestUserPassword();

  await loginPage.mockLoginRequest({
    accessToken: 'TestAccessToken',
    refreshToken: 'TestRefreshToken',
  });

  await loginPage.fillUserEmail(email);

  await loginPage.fillUserPassword(password);

  await loginPage.pressLogin();

  await loginPage.checkNoErrors();
});
