import { beforeEach, expect, describe, it } from 'vitest';

import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController.js';
import { GenreAdminHttpController } from './api/httpControllers/genreAdminHttpController/genreAdminHttpController.js';
import { GenreHttpController } from './api/httpControllers/genreHttpController/genreHttpController.js';
import { UserBookHttpController } from './api/httpControllers/userBookHttpController/userBookHttpController.js';
import { bookSymbols } from './symbols.js';
import { Application } from '../../core/application.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

describe('BookModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<BookHttpController>(bookSymbols.bookHttpController)).toBeInstanceOf(BookHttpController);

    expect(container.get<GenreHttpController>(bookSymbols.genreHttpController)).toBeInstanceOf(GenreHttpController);

    expect(container.get<GenreAdminHttpController>(bookSymbols.genreAdminHttpController)).toBeInstanceOf(
      GenreAdminHttpController,
    );

    expect(container.get<UserBookHttpController>(bookSymbols.userBookHttpController)).toBeInstanceOf(
      UserBookHttpController,
    );
  });
});
