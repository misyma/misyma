import { type S3Client } from '@aws-sdk/client-s3';

import { Application } from '../src/core/application.js';
import { coreSymbols } from '../src/core/symbols.js';
import { type DependencyInjectionContainer } from '../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { type EmailService } from '../src/libs/emailService/emailService.js';
import { type LoggerService } from '../src/libs/logger/loggerService.js';
import { S3TestUtils } from '../src/libs/s3/tests/s3TestUtils.js';
import { AuthorTestUtils } from '../src/modules/bookModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { BookChangeRequestTestUtils } from '../src/modules/bookModule/tests/utils/bookChangeRequestTestUtils/bookChangeRequestTestUtils.js';
import { BookReadingTestUtils } from '../src/modules/bookModule/tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { BookTestUtils } from '../src/modules/bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { BorrowingTestUtils } from '../src/modules/bookModule/tests/utils/borrowingTestUtils/borrowingTestUtils.js';
import { CollectionTestUtils } from '../src/modules/bookModule/tests/utils/collectionTestUtils/collectionTestUtils.js';
import { GenreTestUtils } from '../src/modules/bookModule/tests/utils/genreTestUtils/genreTestUtils.js';
import { QuoteTestUtils } from '../src/modules/bookModule/tests/utils/quoteTestUtils/quoteTestUtils.js';
import { TestDataOrchestrator } from '../src/modules/bookModule/tests/utils/testDataOrchestrator/testDataOrchestrator.js';
import { UserBookTestUtils } from '../src/modules/bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { BookshelfTestUtils } from '../src/modules/bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../src/modules/databaseModule/symbols.js';
import { type DatabaseClient } from '../src/modules/databaseModule/types/databaseClient.js';
import { type EmailMessageBus } from '../src/modules/userModule/application/messageBuses/emailMessageBus/emailMessageBus.js';
import { symbols as userSymbols } from '../src/modules/userModule/symbols.js';
import { BlacklistTokenTestUtils } from '../src/modules/userModule/tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { EmailEventTestUtils } from '../src/modules/userModule/tests/utils/emailEventTestUtils/emailEventTestUtils.js';
import { UserTestUtils } from '../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';

import { testSymbols } from './symbols.js';

export class TestContainer {
  public static async create(): Promise<DependencyInjectionContainer> {
    const container = Application.createContainer();

    container.bind<BookTestUtils>(
      testSymbols.bookTestUtils,
      () => new BookTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<UserBookTestUtils>(
      testSymbols.userBookTestUtils,
      () => new UserBookTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<GenreTestUtils>(
      testSymbols.genreTestUtils,
      () => new GenreTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<UserTestUtils>(
      testSymbols.userTestUtils,
      () => new UserTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<BlacklistTokenTestUtils>(
      testSymbols.blacklistTokenTestUtils,
      () => new BlacklistTokenTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<AuthorTestUtils>(
      testSymbols.authorTestUtils,
      () => new AuthorTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<EmailEventTestUtils>(
      testSymbols.emailEventTestUtils,
      () => new EmailEventTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<BookshelfTestUtils>(
      testSymbols.bookshelfTestUtils,
      () => new BookshelfTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<BookReadingTestUtils>(
      testSymbols.bookReadingTestUtils,
      () => new BookReadingTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<BorrowingTestUtils>(
      testSymbols.borrowingTestUtils,
      () => new BorrowingTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<QuoteTestUtils>(
      testSymbols.quoteTestUtils,
      () => new QuoteTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<CollectionTestUtils>(
      testSymbols.collectionTestUtils,
      () => new CollectionTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<TestDataOrchestrator>(
      testSymbols.testDataOrchestrator,
      () =>
        new TestDataOrchestrator(
          container.get<GenreTestUtils>(testSymbols.genreTestUtils),
          container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils),
          container.get<AuthorTestUtils>(testSymbols.authorTestUtils),
          container.get<BookTestUtils>(testSymbols.bookTestUtils),
          container.get<UserBookTestUtils>(testSymbols.userBookTestUtils),
        ),
    );

    await container.overrideBinding<LoggerService>(
      coreSymbols.loggerService,
      () =>
        ({
          info: (): void => {},
          error: (): void => {},
          debug: (): void => {},
          warn: (): void => {},
        }) as unknown as LoggerService,
    );

    await container.overrideBinding<EmailService>(coreSymbols.emailService, () => ({
      sendEmail: async (): Promise<void> => {},
    }));

    await container.overrideBinding<EmailMessageBus>(userSymbols.emailMessageBus, () => ({
      sendEvent: async (): Promise<void> => {},
    }));

    container.bind<S3TestUtils>(
      testSymbols.s3TestUtils,
      () => new S3TestUtils(container.get<S3Client>(coreSymbols.s3Client)),
    );

    container.bind<BookChangeRequestTestUtils>(
      testSymbols.bookChangeRequestTestUtils,
      () => new BookChangeRequestTestUtils(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    return container;
  }
}
