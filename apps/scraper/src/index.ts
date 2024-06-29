/* eslint-disable @typescript-eslint/no-explicit-any */

import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { ScrapeOpenLibraryAction } from './actions/scrapeOpenLibraryAction.js';
import { ConfigFactory } from './config.js';
import { AuthorRepository } from './db/repositories/authorRepository/authorRepository.js';
import { BaseError } from './errors/baseError.js';
import { DatabaseClientType } from './libs/database/databaseClientConfig.js';
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
    clientType: DatabaseClientType.sqlite,
    filePath: config.databasePath,
    useNullAsDefault: true,
    minPoolConnections: 1,
    maxPoolConnections: 1,
  });

  const uuidService = new UuidService();

  const authorRepository = new AuthorRepository(dbClient, uuidService);

  const scrapeOpenLibraryAction = new ScrapeOpenLibraryAction(authorRepository, logger);

  yargs(hideBin(process.argv))
    .command([
      {
        command: 'scrape openlibrary',
        describe: 'Scrape resources from Open Library.',
        builder: (builder: any): Argv => {
          return builder.usage('Usage: scraper scrape openlibrary');
        },
        handler: async (): Promise<void> => {
          await scrapeOpenLibraryAction.execute();
        },
      },
    ])
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
