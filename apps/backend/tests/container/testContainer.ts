import { testSymbols } from './symbols.js';
import { Application } from '../../src/core/application.js';
import { type ConfigProvider } from '../../src/core/configProvider.js';
import { type SqliteDatabaseClient } from '../../src/core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../src/core/symbols.js';
import { type DependencyInjectionContainer } from '../../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { type HttpService } from '../../src/libs/httpService/services/httpService/httpService.js';
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
import { ApplicationService } from '../e2e/application/applicationService.js';
import { AuthorService } from '../e2e/author/authorService.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    container.bind<ApplicationService>(
      testSymbols.applicationService,
      () =>
        new ApplicationService(
          container.get<HttpService>(coreSymbols.httpService),
          container.get<ConfigProvider>(coreSymbols.configProvider),
        ),
    );

    container.bind<BookTestUtils>(
      testSymbols.bookTestUtils,
      () => new BookTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<GenreTestUtils>(
      testSymbols.genreTestUtils,
      () => new GenreTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<AuthorService>(
      testSymbols.authorService,
      () =>
        new AuthorService(
          container.get<HttpService>(coreSymbols.httpService),
          container.get<ConfigProvider>(coreSymbols.configProvider),
        ),
    );

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<AuthorTestUtils>(
      testSymbols.authorTestUtils,
      () => new AuthorTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<EmailEventTestUtils>(
      testSymbols.emailEventTestUtils,
      () => new EmailEventTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.entityEventsDatabaseClient)),
    );

    container.bind<BookshelfTestUtils>(
      testSymbols.bookshelfTestUtils,
      () => new BookshelfTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<BookReadingTestUtils>(
      testSymbols.bookReadingTestUtils,
      () => new BookReadingTestUtils(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.overrideBinding<EmailService>(userSymbols.emailService, () => ({
      sendEmail: async (): Promise<void> => {},
    }));

    return container;
  }
}
