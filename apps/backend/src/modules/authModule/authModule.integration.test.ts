import { beforeEach, expect, describe, it } from 'vitest';

import { type TokenService } from './application/services/tokenService/tokenService.js';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { authSymbols } from './symbols.js';
import { TestContainer } from '../../../tests/testContainer.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('AuthModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = TestContainer.create();
  });

  it('declares bindings', async () => {
    expect(container.get<TokenService>(authSymbols.tokenService)).toBeInstanceOf(TokenServiceImpl);
  });
});
