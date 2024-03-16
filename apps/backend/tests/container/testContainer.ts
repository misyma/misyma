import { testSymbols } from './symbols.js';
import { Application } from '../../src/core/application.js';
import { coreSymbols } from '../../src/core/symbols.js';
import { type DatabaseClient } from '../../src/libs/database/clients/databaseClient/databaseClient.js';
import { type DependencyInjectionContainer } from '../../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { AuthorTestUtils } from '../../src/modules/authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { BookTestUtils } from '../../src/modules/bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { GenreTestUtils } from '../../src/modules/bookModule/tests/utils/genreTestUtils/genreTestUtils.js';
import { BookReadingTestUtils } from '../../src/modules/bookReadingsModule/tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { BookshelfTestUtils } from '../../src/modules/bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type EmailService } from '../../src/modules/userModule/application/services/emailService/emailService.js';
import { symbols as userSymbols } from '../../src/modules/userModule/symbols.js';
import { BlacklistTokenTestUtils } from '../../src/modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { EmailEventTestUtils } from '../../src/modules/userModule/tests/utils/emailEventTestUtils/emailEventTestUtils.js';
import { UserTestUtils } from '../../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    container.bind<BookTestUtils>(
      testSymbols.bookTestUtils,
      () => new BookTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<GenreTestUtils>(
      testSymbols.genreTestUtils,
      () => new GenreTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<AuthorTestUtils>(
      testSymbols.authorTestUtils,
      () => new AuthorTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<EmailEventTestUtils>(
      testSymbols.emailEventTestUtils,
      () => new EmailEventTestUtils(container.get<DatabaseClient>(coreSymbols.entityEventsDatabaseClient)),
    );

    container.bind<BookshelfTestUtils>(
      testSymbols.bookshelfTestUtils,
      () => new BookshelfTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<BookReadingTestUtils>(
      testSymbols.bookReadingTestUtils,
      () => new BookReadingTestUtils(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.overrideBinding<EmailService>(userSymbols.emailService, () => ({
      sendEmail: async (): Promise<void> => {},
    }));

    return container;
  }
}
