import { expect, test } from '@playwright/test';

import { ShopPage } from '../../pages/shopPage.js';

test('HomePage has correct title', async ({ page }) => {
  const homePage = new ShopPage(page);

  await homePage.goto();

  await expect(page).toHaveTitle(/Philoro/);
});
