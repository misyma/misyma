import { type Page } from '@playwright/test';

export class ShopPage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto('/');
  }

  public async goToCartSummary(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open mini cart' }).nth(1).click();

    await this.page.getByRole('button', { name: 'checkout' }).click();
  }

  public async goToGoldBarsCategory(): Promise<void> {
    await this.page.goto('/shop/gold-bars');
  }

  public async addFirstGoldBarInGridToCart(): Promise<void> {
    await this.page.locator('.flex-1 > button').first().click();
  }
}
