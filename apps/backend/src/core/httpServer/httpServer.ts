/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';
import { type Server } from 'http';

import { InputNotValidError } from '../../common/errors/common/inputNotValidError.js';
import { type HttpController } from '../../common/types/http/httpController.js';
import { HttpStatusCode } from '../../common/types/http/httpStatusCode.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type UserHttpController } from '../../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../../modules/userModule/symbols.js';
import { HttpRouter } from '../httpRouter/httpRouter.js';
import { coreSymbols } from '../symbols.js';

export interface StartPayload {
  readonly host: string;
  readonly port: number;
}

export class HttpServer {
  public readonly fastifyInstance: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.fastifyInstance = fastify({ bodyLimit: 10 * 1024 * 1024 });

    this.httpRouter = new HttpRouter(this.fastifyInstance, container);
  }

  private getControllers(): HttpController[] {
    return [this.container.get<UserHttpController>(userSymbols.userHttpController)];
  }

  public async start(payload: StartPayload): Promise<void> {
    const { host, port } = payload;

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
      context: {
        source: HttpServer.name,
        port,
        host,
      },
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
      };

      if (error instanceof InputNotValidError) {
        reply.status(HttpStatusCode.badRequest).send({ error: formattedError });
      } else {
        reply.status(HttpStatusCode.internalServerError).send({ error: formattedError });
      }

      this.loggerService.error({
        message: 'Caught an error in the HTTP server.',
        context: {
          source: HttpServer.name,
          error: {
            name: error.name,
            message: error.message,
            context: (error as any)?.context,
            stack: error.stack,
            cause: error.cause,
          },
          path: request.url,
          method: request.method,
          statusCode: reply.statusCode,
        },
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
          },
        },
        security: [
          {
            bearerAuth: [],
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

    this.loggerService.info({
      message: 'OpenAPI documentation initialized',
      context: { source: HttpServer.name },
    });
  }
}
