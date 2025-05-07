import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { NationalLibraryBookMapper } from './actions/scrapeNationalLibraryBooksAction/nationalLibraryBookMapper.js';
import { NationalLibraryPageMapper } from './actions/scrapeNationalLibraryBooksAction/nationalLibraryPageMapper.js';
import { ScrapeNationalLibraryBooksAction } from './actions/scrapeNationalLibraryBooksAction/scrapeNationalLibraryBooksAction.js';
import { createConfig } from './config.js';
import { serializeError } from './errors/serializeError.js';
import { NationalLibraryClientFactory } from './infrastructure/clients/nationalLibraryClient.js';
import { AuthorRepository } from './infrastructure/repositories/authorRepository/authorRepository.js';
import { BookRepository } from './infrastructure/repositories/bookRepository/bookRepository.js';
import { CategoryRepository } from './infrastructure/repositories/categoryRepository/categoryRepository.js';
import { DatabaseClientFactory } from './libs/database/databaseClientFactory.js';
import { LoggerServiceFactory } from './libs/logger/loggerServiceFactory.js';
import { UuidService } from './libs/uuid/uuidService.js';

export const finalErrorHandler = async (error: unknown): Promise<void> => {
  const serializedError = serializeError(error);

  console.error({
    message: 'Application error.',
    context: serializedError,
  });

  process.exit(1);
};

process.on('unhandledRejection', finalErrorHandler);

process.on('uncaughtException', finalErrorHandler);

process.on('SIGINT', finalErrorHandler);

process.on('SIGTERM', finalErrorHandler);

try {
  const config = createConfig();

  const logger = LoggerServiceFactory.create(config);

  const dbClient = DatabaseClientFactory.create({
    host: config.database.host,
    port: config.database.port,
    databaseName: config.database.name,
    user: config.database.username,
    password: config.database.password,
    useNullAsDefault: true,
    minPoolConnections: 1,
    maxPoolConnections: 10,
  });

  const uuidService = new UuidService();

  const authorRepository = new AuthorRepository(dbClient, uuidService);

  const bookRepository = new BookRepository(dbClient, uuidService);

  const categoryRepository = new CategoryRepository(dbClient, uuidService);

  const nationalLibraryClient = NationalLibraryClientFactory.create();

  const allCategories = await categoryRepository.findCategories();

  const categoryNamesToIds = allCategories.reduce<Record<string, string>>((acc, category) => {
    acc[category.name] = category.id;

    return acc;
  }, {});

  const nationalLibraryPageMapper = new NationalLibraryPageMapper();

  const nationalLibraryBookMapper = new NationalLibraryBookMapper(categoryNamesToIds, nationalLibraryPageMapper);

  const scrapeNationalLibraryBooksAction = new ScrapeNationalLibraryBooksAction(
    authorRepository,
    bookRepository,
    nationalLibraryBookMapper,
    nationalLibraryClient,
    logger,
  );

  interface ScrapeArgs {
    source: 'nationallibrary';
    resource: 'book';
    from?: number;
  }

  await yargs(hideBin(process.argv))
    .command<ScrapeArgs>(
      'scrape <source> <resource>',
      'Scrape resources',
      (builder: Argv) => {
        return builder
          .positional('source', {
            type: 'string',
            describe: 'Source to scrape from [nationallibrary]',
            choices: ['nationallibrary'],
          })
          .positional('resource', {
            type: 'string',
            describe: 'Resource to scrape (book | category)',
            choices: ['book'],
          })
          .option('from', {
            alias: 'f',
            type: 'number',
            description: 'Start scraping from book number',
          })
          .usage('Usage: scraper scrape <source> <resource> [-f num]');
      },
      async (argv) => {
        await scrapeNationalLibraryBooksAction.execute({ from: argv.from });

        process.exit(0);
      },
    )
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
