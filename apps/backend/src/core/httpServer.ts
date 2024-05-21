/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyMultipart } from '@fastify/multipart';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';
import { type Server } from 'http';

import { type ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config } from './config.js';
import { HttpRouter } from './httpRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { BaseError } from '../common/errors/baseError.js';
import { InputNotValidError } from '../common/errors/inputNotValidError.js';
import { OperationNotValidError } from '../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../common/errors/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../common/errors/resourceNotFoundError.js';
import { type HttpController } from '../common/types/http/httpController.js';
import { HttpStatusCode } from '../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../common/types/http/securityMode.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../modules/authModule/application/errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../modules/authModule/application/errors/unathorizedAccessError.js';
import { type AuthorAdminHttpController } from '../modules/bookModule/api/httpControllers/authorAdminHttpController/authorAdminHttpController.js';
import { type AuthorHttpController } from '../modules/bookModule/api/httpControllers/authorHttpController/authorHttpController.js';
import { type BookAdminHttpController } from '../modules/bookModule/api/httpControllers/bookAdminHttpController/bookAdminHttpController.js';
import { type BookHttpController } from '../modules/bookModule/api/httpControllers/bookHttpController/bookHttpController.js';
import { type BookReadingHttpController } from '../modules/bookModule/api/httpControllers/bookReadingHttpController/bookReadingHttpController.js';
import { type BorrowingHttpController } from '../modules/bookModule/api/httpControllers/borrowingHttpController/borrowingHttpController.js';
import { type GenreAdminHttpController } from '../modules/bookModule/api/httpControllers/genreAdminHttpController/genreAdminHttpController.js';
import { type GenreHttpController } from '../modules/bookModule/api/httpControllers/genreHttpController/genreHttpController.js';
import { type QuoteHttpController } from '../modules/bookModule/api/httpControllers/quoteHttpController/quoteHttpController.js';
import { type UserBookHttpController } from '../modules/bookModule/api/httpControllers/userBookHttpController/userBookHttpController.js';
import { bookSymbols } from '../modules/bookModule/symbols.js';
import { type BookshelfHttpController } from '../modules/bookshelfModule/api/httpControllers/bookshelfHttpController/bookshelfHttpController.js';
import { bookshelfSymbols } from '../modules/bookshelfModule/symbols.js';
import { type UserHttpController } from '../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../modules/userModule/symbols.js';

export class HttpServer {
  public readonly fastifyInstance: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;
  private readonly config: Config;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.config = container.get<Config>(coreSymbols.config);

    this.fastifyInstance = fastify({ bodyLimit: 10 * 1024 * 1024 }).withTypeProvider<TypeBoxTypeProvider>();

    this.httpRouter = new HttpRouter(this.fastifyInstance, container);
  }

  private getControllers(): HttpController[] {
    return [
      this.container.get<ApplicationHttpController>(symbols.applicationHttpController),
      this.container.get<UserHttpController>(userSymbols.userHttpController),
      this.container.get<AuthorHttpController>(bookSymbols.authorHttpController),
      this.container.get<AuthorAdminHttpController>(bookSymbols.authorAdminHttpController),
      this.container.get<BookHttpController>(bookSymbols.bookHttpController),
      this.container.get<BookAdminHttpController>(bookSymbols.bookAdminHttpController),
      this.container.get<UserBookHttpController>(bookSymbols.userBookHttpController),
      this.container.get<GenreHttpController>(bookSymbols.genreHttpController),
      this.container.get<GenreAdminHttpController>(bookSymbols.genreAdminHttpController),
      this.container.get<BookshelfHttpController>(bookshelfSymbols.bookshelfHttpController),
      this.container.get<BookReadingHttpController>(bookSymbols.bookReadingHttpController),
      this.container.get<QuoteHttpController>(bookSymbols.quoteHttpController),
      this.container.get<BorrowingHttpController>(bookSymbols.borrowingHttpController),
    ];
  }

  public async start(): Promise<void> {
    const { host, port } = this.config.server;

    this.setupErrorHandler();

    await this.initSwagger();

    await this.fastifyInstance.register(fastifyMultipart);

    await this.fastifyInstance.register(fastifyHelmet);

    await this.fastifyInstance.register(fastifyCors, {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
    });

    this.fastifyInstance.setSerializerCompiler(() => {
      return (data) => JSON.stringify(data);
    });

    this.addRequestPreprocessing();

    this.httpRouter.registerControllers({
      controllers: this.getControllers(),
    });

    await this.fastifyInstance.listen({
      port,
      host,
    });

    this.loggerService.info({
      message: 'HTTP Server started.',
      port,
      host,
    });
  }

  public getInternalServerInstance(): Server {
    return this.fastifyInstance.server;
  }

  private setupErrorHandler(): void {
    this.fastifyInstance.setSchemaErrorFormatter((errors, dataVar) => {
      const { instancePath, message } = errors[0] as FastifySchemaValidationError;

      return new InputNotValidError({
        reason: `${dataVar}${instancePath} ${message}`,
        value: undefined,
      });
    });

    this.fastifyInstance.setErrorHandler((error, request, reply) => {
      const errorContext = {
        ...(error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
              context: error instanceof BaseError ? error.context : undefined,
            }
          : { error }),
      };

      this.loggerService.error({
        message: 'Caught an error in the HTTP server.',
        endpoint: `${request.method} ${request.url}`,
        error: errorContext,
      });

      const responseError = {
        ...errorContext,
        stack: undefined,
        cause: undefined,
      };

      if (error instanceof InputNotValidError) {
        reply.status(HttpStatusCode.badRequest).send(responseError);
      }

      if (error instanceof ResourceNotFoundError) {
        reply.status(HttpStatusCode.notFound).send(responseError);

        return;
      }

      if (error instanceof OperationNotValidError) {
        reply.status(HttpStatusCode.badRequest).send(responseError);

        return;
      }

      if (error instanceof ResourceAlreadyExistsError) {
        reply.status(HttpStatusCode.conflict).send(responseError);

        return;
      }

      if (error instanceof UnauthorizedAccessError) {
        reply.status(HttpStatusCode.unauthorized).send(responseError);

        return;
      }

      if (error instanceof ForbiddenAccessError) {
        reply.status(HttpStatusCode.forbidden).send(responseError);

        return;
      }

      reply.status(HttpStatusCode.internalServerError).send({
        name: 'InternalServerError',
        message: 'Internal server error',
      });
    });
  }

  private async initSwagger(): Promise<void> {
    await this.fastifyInstance.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Backend API',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            [SecurityMode.bearerToken]: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
    });

    await this.fastifyInstance.register(fastifySwaggerUi, {
      routePrefix: '/api/docs',
      uiConfig: {
        defaultModelRendering: 'model',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
      staticCSP: true,
    });
  }

  private addRequestPreprocessing(): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.fastifyInstance.addHook('preValidation', (request, _reply, next) => {
      const body = request.body as Record<string, unknown>;

      this.trimStringProperties(body);

      next();
    });
  }

  private trimStringProperties(obj: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.trimStringProperties(obj[key]);
      }
    }
  }
}
