import { expect, test } from '@playwright/test';

import { HomePage } from '../../pages/homePage.js';

test('HomePage has correct title', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();

  await expect(page).toHaveTitle(/Misyma/);
});
