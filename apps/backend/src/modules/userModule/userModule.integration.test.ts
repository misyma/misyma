import { beforeEach, expect, describe, it } from 'vitest';

import { UserAdminHttpController } from './api/httpControllers/userAdminHttpController/userAdminHttpController.js';
import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController.js';
import { EmailQueueController } from './api/queueControllers/emailQueueController/emailQueueController.js';
import { userSymbols } from './symbols.js';
import { TestContainer } from '../../../tests/testContainer.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('UserModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = TestContainer.create();
  });

  it('declares bindings', async () => {
    expect(container.get<UserHttpController>(userSymbols.userHttpController)).toBeInstanceOf(UserHttpController);

    expect(container.get<UserAdminHttpController>(userSymbols.userAdminHttpController)).toBeInstanceOf(
      UserAdminHttpController,
    );

    expect(container.get<EmailQueueController>(userSymbols.emailQueueController)).toBeInstanceOf(EmailQueueController);
  });
});
