/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyMultipart } from '@fastify/multipart';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';

import { InputNotValidError } from '../common/errors/inputNotValidError.js';
import { OperationNotValidError } from '../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../common/errors/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../common/errors/resourceNotFoundError.js';
import { serializeError } from '../common/errors/serializeError.js';
import { type HttpController } from '../common/types/http/httpController.js';
import { httpStatusCodes } from '../common/types/http/httpStatusCode.js';
import { securityModes } from '../common/types/http/securityMode.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../modules/authModule/application/errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../modules/authModule/application/errors/unathorizedAccessError.js';
import { type AuthorAdminHttpController } from '../modules/bookModule/api/httpControllers/authorAdminHttpController/authorAdminHttpController.js';
import { type AuthorHttpController } from '../modules/bookModule/api/httpControllers/authorHttpController/authorHttpController.js';
import { type BookAdminHttpController } from '../modules/bookModule/api/httpControllers/bookAdminHttpController/bookAdminHttpController.js';
import { type BookChangeRequestAdminHttpController } from '../modules/bookModule/api/httpControllers/bookChangeRequestAdminHttpController/bookChangeRequestAdminHttpController.js';
import { type BookChangeRequestHttpController } from '../modules/bookModule/api/httpControllers/bookChangeRequestHttpController/bookChangeRequestHttpController.js';
import { type BookHttpController } from '../modules/bookModule/api/httpControllers/bookHttpController/bookHttpController.js';
import { type BookReadingHttpController } from '../modules/bookModule/api/httpControllers/bookReadingHttpController/bookReadingHttpController.js';
import { type BorrowingHttpController } from '../modules/bookModule/api/httpControllers/borrowingHttpController/borrowingHttpController.js';
import { type CollectionHttpController } from '../modules/bookModule/api/httpControllers/collectionHttpController/collectionHttpController.js';
import { type GenreAdminHttpController } from '../modules/bookModule/api/httpControllers/genreAdminHttpController/genreAdminHttpController.js';
import { type GenreHttpController } from '../modules/bookModule/api/httpControllers/genreHttpController/genreHttpController.js';
import { type QuoteHttpController } from '../modules/bookModule/api/httpControllers/quoteHttpController/quoteHttpController.js';
import { type UserBookHttpController } from '../modules/bookModule/api/httpControllers/userBookHttpController/userBookHttpController.js';
import { bookSymbols } from '../modules/bookModule/symbols.js';
import { type BookshelfHttpController } from '../modules/bookshelfModule/api/httpControllers/bookshelfHttpController/bookshelfHttpController.js';
import { bookshelfSymbols } from '../modules/bookshelfModule/symbols.js';
import { type UserAdminHttpController } from '../modules/userModule/api/httpControllers/userAdminHttpController/userAdminHttpController.js';
import { type UserHttpController } from '../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../modules/userModule/symbols.js';

import { type ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config } from './config.js';
import { HttpRouter } from './httpRouter.js';
import { coreSymbols, symbols } from './symbols.js';

export class HttpServer {
  public readonly fastifyServer: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;
  private readonly config: Config;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.config = container.get<Config>(coreSymbols.config);

    this.fastifyServer = fastify({ bodyLimit: 10 * 1024 * 1024 }).withTypeProvider<TypeBoxTypeProvider>();

    this.httpRouter = new HttpRouter(this.fastifyServer);
  }

  private getControllers(): HttpController[] {
    return [
      this.container.get<ApplicationHttpController>(symbols.applicationHttpController),
      this.container.get<UserHttpController>(userSymbols.userHttpController),
      this.container.get<UserAdminHttpController>(userSymbols.userAdminHttpController),
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
      this.container.get<CollectionHttpController>(bookSymbols.collectionHttpController),
      this.container.get<BookChangeRequestHttpController>(bookSymbols.bookChangeRequestHttpController),
      this.container.get<BookChangeRequestAdminHttpController>(bookSymbols.bookChangeRequestAdminHttpController),
    ];
  }

  public async start(): Promise<void> {
    const { host, port } = this.config.server;

    this.setupErrorHandler();

    await this.initSwagger();

    await this.fastifyServer.register(fastifyMultipart);

    await this.fastifyServer.register(fastifyHelmet);

    await this.fastifyServer.register(fastifyCors, {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
    });

    this.fastifyServer.addHook('onRequest', (request, _reply, done) => {
      if (
        request.url.includes(`${this.httpRouter.rootPath}/docs`) ||
        request.url.includes(`${this.httpRouter.rootPath}/health`)
      ) {
        done();
        return;
      }

      this.loggerService.info({
        message: 'HTTP request received.',
        endpoint: `${request.method} ${request.url}`,
      });

      done();
    });

    this.fastifyServer.addHook('onSend', (request, reply, _payload, done) => {
      if (
        request.url.includes(`${this.httpRouter.rootPath}/docs`) ||
        request.url.includes(`${this.httpRouter.rootPath}/health`)
      ) {
        done();
        return;
      }

      this.loggerService.info({
        message: 'HTTP response sent.',
        endpoint: `${request.method} ${request.url}`,
        statusCode: reply.statusCode,
      });

      done();
    });

    this.fastifyServer.setSerializerCompiler(() => {
      return (data): string => JSON.stringify(data);
    });

    this.addRequestPreprocessing();

    this.httpRouter.registerControllers({
      controllers: this.getControllers(),
    });

    await this.fastifyServer.listen({
      port,
      host,
    });

    this.loggerService.info({
      message: 'HTTP Server started.',
      port,
      host,
    });
  }

  public async stop(): Promise<void> {
    await this.fastifyServer.close();

    this.loggerService.info({
      message: 'HTTP Server stopped.',
    });
  }

  private setupErrorHandler(): void {
    this.fastifyServer.setSchemaErrorFormatter((errors, dataVar) => {
      const { instancePath, message } = errors[0] as FastifySchemaValidationError;

      return new InputNotValidError({
        reason: `${dataVar}${instancePath} ${message || ''}`,
        value: undefined,
      });
    });

    this.fastifyServer.setErrorHandler((error, request, reply) => {
      const serializedError = serializeError(error);

      this.loggerService.error({
        message: 'Caught an error in the HTTP server.',
        endpoint: `${request.method} ${request.url}`,
        error: serializedError,
      });

      const responseError = {
        ...serializedError,
        stack: undefined,
        cause: undefined,
        context: {
          ...(serializedError['context'] ? (serializedError['context'] as Record<string, unknown>) : {}),
          originalError: undefined,
        },
      };

      if (error instanceof InputNotValidError) {
        return reply.status(httpStatusCodes.badRequest).send(responseError);
      }

      if (error instanceof ResourceNotFoundError) {
        return reply.status(httpStatusCodes.notFound).send(responseError);
      }

      if (error instanceof OperationNotValidError) {
        return reply.status(httpStatusCodes.badRequest).send(responseError);
      }

      if (error instanceof ResourceAlreadyExistsError) {
        return reply.status(httpStatusCodes.conflict).send(responseError);
      }

      if (error instanceof UnauthorizedAccessError) {
        return reply.status(httpStatusCodes.unauthorized).send(responseError);
      }

      if (error instanceof ForbiddenAccessError) {
        return reply.status(httpStatusCodes.forbidden).send(responseError);
      }

      return reply.status(httpStatusCodes.internalServerError).send({
        name: 'InternalServerError',
        message: 'Internal server error',
      });
    });
  }

  private async initSwagger(): Promise<void> {
    await this.fastifyServer.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Backend API',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            [securityModes.bearerToken]: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
    });

    await this.fastifyServer.register(fastifySwaggerUi, {
      routePrefix: `${this.httpRouter.rootPath}/docs`,
      uiConfig: {
        defaultModelRendering: 'model',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
      staticCSP: true,
    });
  }

  private addRequestPreprocessing(): void {
    this.fastifyServer.addHook('preValidation', (request, _reply, next) => {
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
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.trimStringProperties(obj[key] as Record<string, any>);
        }
      }
    }
  }
}
