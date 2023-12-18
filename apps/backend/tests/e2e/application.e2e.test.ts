import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type ApplicationService } from './application/applicationService.js';
import { TestApplication } from './testApplication/testApplication.js';
import { testSymbols } from '../container/symbols.js';

describe('Application', () => {
  let application: TestApplication;

  let applicationService: ApplicationService;

  beforeEach(async () => {
    application = new TestApplication();

    const container = application.createContainer();

    applicationService = container.get<ApplicationService>(testSymbols.applicationService);

    await application.start();
  });

  afterEach(async () => {
    await application.stop();
  });

  it('returns 200 OK with checks in body', async () => {
    const response = await applicationService.checkHealth();

    expect(response.healthy).toBeTruthy();

    const checks = response.checks;

    checks.forEach((check) => expect(check.healthy).toBeTruthy());
  });
});
