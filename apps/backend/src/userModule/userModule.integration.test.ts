import { beforeEach, expect, describe, it } from 'vitest';

import { UserHttpController } from './api/httpControllers/userHttpController/userHttpController.js';
import { type TokenService } from './application/services/tokenService/tokenService.js';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { userSymbols } from './symbols.js';
import { Application } from '../core/application.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('UserModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<TokenService>(userSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);

    expect(container.get<UserHttpController>(userSymbols.userHttpController)).toBeInstanceOf(UserHttpController);
  });
});
