/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';
import { type Server } from 'http';

import { InputNotValidError } from '../../common/errors/common/inputNotValidError.js';
import { type HttpController } from '../../common/types/http/httpController.js';
import { HttpStatusCode } from '../../common/types/http/httpStatusCode.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type AuthorHttpController } from '../../modules/authorModule/api/httpControllers/authorHttpController/authorHttpController.js';
import { authorSymbols } from '../../modules/authorModule/symbols.js';
import { type BookHttpController } from '../../modules/bookModule/api/httpControllers/bookHttpController/bookHttpController.js';
import { type GenreAdminHttpController } from '../../modules/bookModule/api/httpControllers/genreAdminHttpController/genreAdminHttpController.js';
import { type GenreHttpController } from '../../modules/bookModule/api/httpControllers/genreHttpController/genreHttpController.js';
import { bookSymbols } from '../../modules/bookModule/symbols.js';
import { type BookReadingHttpController } from '../../modules/bookReadingsModule/api/httpControllers/bookReadingHttpController/bookReadingHttpController.js';
import { bookReadingSymbols } from '../../modules/bookReadingsModule/symbols.js';
import { type BookshelfHttpController } from '../../modules/bookshelfModule/api/httpControllers/bookshelfHttpController/bookshelfHttpController.js';
import { bookshelfSymbols } from '../../modules/bookshelfModule/symbols.js';
import { type UserHttpController } from '../../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../../modules/userModule/symbols.js';
import { type ApplicationHttpController } from '../api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type ConfigProvider } from '../configProvider.js';
import { HttpRouter } from '../httpRouter/httpRouter.js';
import { coreSymbols, symbols } from '../symbols.js';

export class HttpServer {
  public readonly fastifyInstance: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;
  private readonly configProvider: ConfigProvider;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.configProvider = container.get<ConfigProvider>(coreSymbols.configProvider);

    this.fastifyInstance = fastify({ bodyLimit: 10 * 1024 * 1024 }).withTypeProvider<TypeBoxTypeProvider>();

    this.httpRouter = new HttpRouter(this.fastifyInstance, container);
  }

  private getControllers(): HttpController[] {
    return [
      this.container.get<UserHttpController>(userSymbols.userHttpController),
      this.container.get<BookHttpController>(bookSymbols.bookHttpController),
      this.container.get<AuthorHttpController>(authorSymbols.authorHttpController),
      this.container.get<ApplicationHttpController>(symbols.applicationHttpController),
      this.container.get<BookshelfHttpController>(bookshelfSymbols.bookshelfHttpController),
      this.container.get<GenreHttpController>(bookSymbols.genreHttpController),
      this.container.get<GenreAdminHttpController>(bookSymbols.genreAdminHttpController),
      this.container.get<BookReadingHttpController>(bookReadingSymbols.bookReadingHttpController),
    ];
  }

  public async start(): Promise<void> {
    const host = this.configProvider.getServerHost();

    const port = this.configProvider.getServerPort();

    this.setupErrorHandler();

    await this.initSwagger();

    await this.fastifyInstance.register(fastifyHelmet);

    await this.fastifyInstance.register(fastifyCors, {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
    });

    this.fastifyInstance.setSerializerCompiler(() => {
      return (data) => JSON.stringify(data);
    });

    this.httpRouter.registerControllers({
      controllers: this.getControllers(),
    });

    await this.fastifyInstance.listen({
      port,
      host,
    });

    this.loggerService.info({
      message: `HTTP Server started.`,
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
      const formattedError = {
        name: error.name,
        message: error.message,
        ...(error as any)?.context,
      };

      if (error instanceof InputNotValidError) {
        reply.status(HttpStatusCode.badRequest).send({ ...formattedError });
      } else {
        reply.status(HttpStatusCode.internalServerError).send({ ...formattedError });
      }

      this.loggerService.error({
        message: 'Caught an error in the HTTP server.',
        error: {
          ...formattedError,
          stack: error.stack,
          cause: error.cause,
        },
        path: request.url,
        method: request.method,
        statusCode: reply.statusCode,
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
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            },
            basicAuth: {
              type: 'http',
              scheme: 'basic',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
            basicAuth: [],
          },
        ],
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

    this.loggerService.debug({
      message: 'OpenAPI documentation initialized.',
      path: '/api/docs',
    });
  }
}
