import test from '@playwright/test';
import config from 'config';
import { LoginPage } from '../pages/loginPage';
import { mockUserLogin } from '../mocks/userApiMocks';
import { Generator } from '../utils/generator';

test('shows an error - when email is invalid', async ({ page }) => {
  const appBaseUrl = config.get<string>('appUrl');

  await page.goto(appBaseUrl);

  const loginPage = new LoginPage(page);

  await loginPage.fillUserEmail('invalid');

  await loginPage.checkEmailError();
});

test('login handled successfully', async ({ page }) => {
  const appBaseUrl = config.get('appUrl');

  await page.goto(`${appBaseUrl}`);

  const loginPage = new LoginPage(page);

  const userCredentials = {
    email: Generator.email(),
    password: Generator.password(10),
  };

  await mockUserLogin({
    page,
    acceptEmail: userCredentials.email,
    acceptPassword: userCredentials.password,
  });

  await loginPage.fillUserEmail(userCredentials.email);

  await loginPage.fillUserPassword(userCredentials.password);

  await loginPage.pressLogin();

  await loginPage.checkNoErrors();
});
