/* eslint-disable @typescript-eslint/no-explicit-any */

import { XMLParser } from 'fast-xml-parser';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { EIsbnMapper } from './actions/scrapeEIsbnAction/eIsbnMapper.js';
import { ScrapeEIsbnAction, type ScrapeEIsbnActionPayload } from './actions/scrapeEIsbnAction/scrapeEIsbnAction.js';
import { OpenLibraryMapper } from './actions/scrapeOpenLibraryAction/openLibraryMapper.js';
import {
  ScrapeOpenLibraryAction,
  type ScrapeOpenLibraryActionPayload,
} from './actions/scrapeOpenLibraryAction/scrapeOpenLibraryAction.js';
import { ConfigFactory } from './config.js';
import { BaseError } from './errors/baseError.js';
import { EIsbnClientFactory } from './infrastructure/clients/eIsbnClient.js';
import { AuthorRepository } from './infrastructure/repositories/authorRepository/authorRepository.js';
import { BookRepository } from './infrastructure/repositories/bookRepository/bookRepository.js';
import { DatabaseClientFactory } from './libs/database/databaseClientFactory.js';
import { LoggerServiceFactory } from './libs/logger/loggerServiceFactory.js';
import { UuidService } from './libs/uuid/uuidService.js';

const finalErrorHandler = async (error: unknown): Promise<void> => {
  let errorContext;

  if (error instanceof Error) {
    errorContext = {
      name: error.name,
      message: error.message,
      ...(error instanceof BaseError ? { ...error.context } : undefined),
    };
  } else {
    errorContext = error;
  }

  console.error(
    JSON.stringify({
      message: 'Application error.',
      context: errorContext,
    }),
  );

  process.exit(1);
};

process.on('unhandledRejection', finalErrorHandler);

process.on('uncaughtException', finalErrorHandler);

process.on('SIGINT', finalErrorHandler);

process.on('SIGTERM', finalErrorHandler);

try {
  const config = ConfigFactory.create();

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

  const openLibraryMapper = new OpenLibraryMapper();

  const scrapeOpenLibraryAction = new ScrapeOpenLibraryAction(
    authorRepository,
    bookRepository,
    openLibraryMapper,
    config,
    logger,
  );

  const eisbnClient = EIsbnClientFactory.create(config);

  const eIsbnMapper = new EIsbnMapper();

  const parser = new XMLParser();

  const scrapeEIsbnAction = new ScrapeEIsbnAction(
    authorRepository,
    bookRepository,
    eIsbnMapper,
    eisbnClient,
    logger,
    parser,
  );

  yargs(hideBin(process.argv))
    .command([
      {
        command: 'scrape openlibrary',
        describe: 'Scrape resources from Open Library.',
        builder: (builder: Argv): Argv<ScrapeOpenLibraryActionPayload> => {
          return builder
            .option({
              from: {
                description: 'Start scraping from book number',
                number: true,
                alias: 'f',
              },
            })
            .usage('Usage: scraper scrape openlibrary');
        },
        handler: async (argv: any): Promise<void> => {
          await scrapeOpenLibraryAction.execute(argv);

          process.exit(0);
        },
      },
      {
        command: 'scrape eisbn',
        describe: 'Scrape resources from E-ISBN.',
        builder: (builder: Argv): Argv<ScrapeEIsbnActionPayload> => {
          return builder
            .option({
              from: {
                description: 'Start scraping from book number',
                number: true,
                alias: 'f',
              },
            })
            .usage('Usage: scraper scrape eisbn');
        },
        handler: async (argv: any): Promise<void> => {
          await scrapeEIsbnAction.execute(argv);

          process.exit(0);
        },
      },
    ])
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
