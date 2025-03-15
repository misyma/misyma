/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMLParser } from 'fast-xml-parser';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { BnMapper } from './actions/scrapeBnAction/bnMapper.js';
import { ScrapeBnAction, type ScrapeBnActionPayload } from './actions/scrapeBnAction/scrapeBnAction.js';
import { EIsbnMapper } from './actions/scrapeEIsbnAction/eIsbnMapper.js';
import { ScrapeEIsbnAction, type ScrapeEIsbnActionPayload } from './actions/scrapeEIsbnAction/scrapeEIsbnAction.js';
import { createConfig } from './config.js';
import { serializeError } from './errors/serializeError.js';
import { BnClientFactory } from './infrastructure/clients/bnClient.js';
import { EIsbnClientFactory } from './infrastructure/clients/eIsbnClient.js';
import { AuthorRepository } from './infrastructure/repositories/authorRepository/authorRepository.js';
import { BookRepository } from './infrastructure/repositories/bookRepository/bookRepository.js';
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

  const bnClient = BnClientFactory.create();

  const bnMapper = new BnMapper();

  const scrapeBnAction = new ScrapeBnAction(authorRepository, bookRepository, bnMapper, bnClient, logger);

  yargs(hideBin(process.argv))
    .command(
      'scrape eisbn',
      'Scrape resources from E-ISBN.',
      (builder: Argv): Argv<ScrapeEIsbnActionPayload> => {
        return builder
          .option('from', {
            description: 'Start scraping from book number',
            type: 'number',
            alias: 'f',
          })
          .usage('Usage: scraper scrape eisbn');
      },
      async (argv: any): Promise<void> => {
        await scrapeEIsbnAction.execute(argv);

        process.exit(0);
      },
    )
    .command(
      'scrape bn',
      'Scrape resources from Biblioteka Narodowa.',
      (builder: Argv): Argv<ScrapeBnActionPayload> => {
        return builder
          .option('from', {
            description: 'Start scraping from book number',
            type: 'number',
            alias: 'f',
          })
          .usage('Usage: scraper scrape bn');
      },
      async (argv: any): Promise<void> => {
        await scrapeBnAction.execute(argv);

        process.exit(0);
      },
    )
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
