import { type Page } from '@playwright/test';

import { type MockResponse } from './mockResponse.js';
import { E2ETestConfigProvider } from '../config/e2eTestConfigProvider.js';

interface MockResponsePayload {
  page: Page;
  response: MockResponse;
}

export class UserApiMocksService {
  private mocksEnabled = E2ETestConfigProvider.areMocksEnabled();

  public async mockUserLogin(payload: MockResponsePayload): Promise<void> {
    const { page, response } = payload;

    if (!this.mocksEnabled) {
      return;
    }

    await page.route(new RegExp(/\/api\/user\/login$/), (route) => {
      if (!this.mocksEnabled) {
        return;
      }

      route.fulfill({
        status: response.statusCode,
        contentType: response.contentType,
        body: response.getStringifiedBody(),
      });
    });
  }

  public async mockUserRegistration(payload: MockResponsePayload): Promise<void> {
    const { page, response } = payload;

    if (!this.mocksEnabled) {
      return;
    }

    await page.route(new RegExp(/\/api\/user\/register$/), (route) => {
      route.fulfill({
        status: response.statusCode,
        contentType: response.contentType,
        body: response.getStringifiedBody(),
      });
    });
  }
}
