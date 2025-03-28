/* eslint-disable @typescript-eslint/no-explicit-any */

import { XMLParser } from 'fast-xml-parser';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { EisbnBookMapper } from './actions/scrapeEIsbnBooksAction/eIsbnBookMapper.js';
import { ScrapeEisbnBooksAction } from './actions/scrapeEIsbnBooksAction/scrapeEisbnBooksAction.js';
import { NationalLibraryBookMapper } from './actions/scrapeNationalLibraryBooksAction/nationalLibraryBookMapper.js';
import { ScrapeNationalLibraryBooksAction } from './actions/scrapeNationalLibraryBooksAction/scrapeNationalLibraryBooksAction.js';
import { ScrapeNationalLibraryGenresAction } from './actions/scrapeNationalLibraryGenresAction/scrapeNationalLibraryGenresAction.js';
import { createConfig } from './config.js';
import { serializeError } from './errors/serializeError.js';
import { EisbnClientFactory } from './infrastructure/clients/eisbnClient.js';
import { NationalLibraryClientFactory } from './infrastructure/clients/nationalLibraryClient.js';
import { AuthorRepository } from './infrastructure/repositories/authorRepository/authorRepository.js';
import { BookRepository } from './infrastructure/repositories/bookRepository/bookRepository.js';
import { GenreRepository } from './infrastructure/repositories/genreRepository/genreRepository.js';
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

  const genreRepository = new GenreRepository(dbClient, uuidService);

  const eisbnClient = EisbnClientFactory.create(config);

  const eIsbnMapper = new EisbnBookMapper();

  const parser = new XMLParser();

  const scrapeEisbnAction = new ScrapeEisbnBooksAction(
    authorRepository,
    bookRepository,
    eIsbnMapper,
    eisbnClient,
    logger,
    parser,
  );

  const nationalLibraryClient = NationalLibraryClientFactory.create();

  const nationalLibraryBookMapper = new NationalLibraryBookMapper();

  const scrapeNationalLibraryBooksAction = new ScrapeNationalLibraryBooksAction(
    authorRepository,
    bookRepository,
    nationalLibraryBookMapper,
    nationalLibraryClient,
    logger,
  );

  const scrapeNationalLibraryGenresAction = new ScrapeNationalLibraryGenresAction(
    genreRepository,
    nationalLibraryClient,
    logger,
  );

  yargs(hideBin(process.argv))
    .command(
      'scrape <source> <resource>',
      'Scrape resources',
      (builder: Argv) => {
        return builder
          .positional('source', {
            type: 'string',
            describe: 'Source to scrape from (eisbn | nationallibrary)',
            choices: ['eisbn', 'nationallibrary'],
          })
          .positional('resource', {
            type: 'string',
            describe: 'Resource to scrape (book | genre)',
            choices: ['book', 'genre'],
          })
          .option('from', {
            alias: 'f',
            type: 'number',
            description: 'Start scraping from book number',
          })
          .usage('Usage: scraper scrape <source> <resource> [-f num]');
      },
      async (argv: any) => {
        switch (argv.source) {
          case 'eisbn':
            if (argv.resource !== 'book') {
              console.error('Resource not supported');
              break;
            }

            await scrapeEisbnAction.execute(argv);

            break;
          case 'nationallibrary':
            if (argv.resource === 'genre') {
              await scrapeNationalLibraryGenresAction.execute(argv);
              break;
            }

            await scrapeNationalLibraryBooksAction.execute(argv);
            break;
          default:
            console.error('Unknown source');
            break;
        }
        process.exit(0);
      },
    )
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
