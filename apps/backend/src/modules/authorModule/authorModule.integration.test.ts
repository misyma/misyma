import { beforeEach, expect, describe, it } from 'vitest';

import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController.js';
import { authorSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('AuthorModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<AuthorHttpController>(authorSymbols.authorHttpController)).toBeInstanceOf(
      AuthorHttpController,
    );
  });
});
