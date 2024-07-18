/* eslint-disable @typescript-eslint/no-explicit-any */

import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { OpenLibraryMapper } from './actions/scrapeOpenLibraryAction/openLibraryMapper.js';
import {
  ScrapeOpenLibraryAction,
  type ScrapeOpenLibraryActionExecutePayload,
} from './actions/scrapeOpenLibraryAction/scrapeOpenLibraryAction.js';
import { ConfigFactory } from './config.js';
import { BaseError } from './errors/baseError.js';
import { MisymaHttpClientFactory } from './infrastructure/clients/misymaHttpClient.js';
import { LoggerServiceFactory } from './libs/logger/loggerServiceFactory.js';

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

  const openLibraryMapper = new OpenLibraryMapper();

  const misymaHttpClient = MisymaHttpClientFactory.create(config);

  const scrapeOpenLibraryAction = new ScrapeOpenLibraryAction(misymaHttpClient, openLibraryMapper, config, logger);

  yargs(hideBin(process.argv))
    .command([
      {
        command: 'scrape openlibrary',
        describe: 'Scrape resources from Open Library.',
        builder: (builder: Argv): Argv<ScrapeOpenLibraryActionExecutePayload> => {
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
        },
      },
    ])
    .help().argv;
} catch (error) {
  await finalErrorHandler(error);
}
