import { beforeEach, expect, describe, it } from 'vitest';

import { AuthorAdminHttpController } from './api/httpControllers/authorAdminHttpController/authorAdminHttpController.js';
import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController.js';
import { type FindAuthorsByIdsQueryHandler } from './application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandler.js';
import { FindAuthorsByIdsQueryHandlerImpl } from './application/queryHandlers/findAuthorsByIdsQueryHandler/findAuthorsByIdsQueryHandlerImpl.js';
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

    expect(container.get<AuthorAdminHttpController>(authorSymbols.authorAdminHttpController)).toBeInstanceOf(
      AuthorAdminHttpController,
    );

    expect(container.get<FindAuthorsByIdsQueryHandler>(authorSymbols.findAuthorsByIdsQueryHandler)).toBeInstanceOf(
      FindAuthorsByIdsQueryHandlerImpl,
    );
  });
});
