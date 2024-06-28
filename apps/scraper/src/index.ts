import { ConfigFactory } from './config.js';
import { BaseError } from './errors/baseError.js';
import { LoggerServiceFactory } from './libs/logger/loggerServiceFactory.js';

const finalErrorHandler = async (error: unknown): Promise<void> => {
  let errorContext;

  if (error instanceof Error) {
    errorContext = {
      name: error.name,
      message: error.message,
      stack: error.stack,
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

  process.exitCode = 1;
};

process.on('unhandledRejection', finalErrorHandler);

process.on('uncaughtException', finalErrorHandler);

process.on('SIGINT', finalErrorHandler);

process.on('SIGTERM', finalErrorHandler);

try {
  const config = ConfigFactory.create();

  const logger = LoggerServiceFactory.create(config);

  logger.info({ message: 'Application started.' });
} catch (error) {
  await finalErrorHandler(error);
}
