import { type Page } from '@playwright/test';

export class HomePage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
