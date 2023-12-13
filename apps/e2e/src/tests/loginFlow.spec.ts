import { test } from '@playwright/test';
import config from 'config';

import { Generator } from '@common/tests';

import { UserApiMocksService } from '../mocks/userApiMocksService.js';
import { LoginPage } from '../pages/loginPage.js';

test('shows an error - when email is invalid', async ({ page }) => {
  const appBaseUrl = config.get<string>('application.url');

  await page.goto(appBaseUrl);

  const loginPage = new LoginPage(page);

  await loginPage.fillUserEmail('invalid');

  await loginPage.checkEmailError();
});

test('login handled successfully', async ({ page }) => {
  const appBaseUrl = config.get('application.url');

  const userApiMocksService = new UserApiMocksService();

  await page.goto(`${appBaseUrl}`);

  const loginPage = new LoginPage(page);

  const userCredentials = {
    email: Generator.email(),
    password: Generator.password(10),
  };

  await userApiMocksService.mockUserLogin({
    page,
    acceptEmail: userCredentials.email,
    acceptPassword: userCredentials.password,
  });

  await loginPage.fillUserEmail(userCredentials.email);

  await loginPage.fillUserPassword(userCredentials.password);

  await loginPage.pressLogin();

  await loginPage.checkNoErrors();
});
