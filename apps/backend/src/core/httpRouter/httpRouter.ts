/* eslint-disable @typescript-eslint/no-explicit-any */

import { type FastifyInstance, type FastifyReply, type FastifyRequest, type FastifySchema } from 'fastify';

import { type HttpController } from '../../common/types/http/httpController.js';
import { HttpHeader } from '../../common/types/http/httpHeader.js';
import { type HttpRouteSchema, type HttpRoute } from '../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../common/types/http/httpStatusCode.js';
import { ApplicationError } from '../../common/validation/errors/base/applicationError.js';
import { BaseError } from '../../common/validation/errors/base/baseError.js';
import { DomainError } from '../../common/validation/errors/base/domainError.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { coreSymbols } from '../symbols.js';

export interface RegisterControllersPayload {
  controllers: HttpController[];
}

export interface RegisterRoutesPayload {
  routes: HttpRoute[];
  basePath: string;
}

export interface NormalizePathPayload {
  path: string;
}

export class HttpRouter {
  private readonly rootPath = '';
  private readonly loggerService: LoggerService;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly container: DependencyInjectionContainer,
  ) {
    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);
  }

  public registerControllers(payload: RegisterControllersPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const { basePath } = controller;

      const routes = controller.getHttpRoutes();

      this.registerRoutes({
        routes,
        basePath,
      });
    });
  }

  private registerRoutes(payload: RegisterRoutesPayload): void {
    const { routes, basePath } = payload;

    routes.map((httpRoute) => {
      const { method, path: controllerPath, tags, description } = httpRoute;

      const path = this.normalizePath({ path: `/${this.rootPath}/${basePath}/${controllerPath}` });

      const handler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        const requestDate = new Date();

        try {
          this.loggerService.info({
            message: 'Received an HTTP request.',
            context: {
              source: HttpRouter.name,
              path: fastifyRequest.url,
              method,
              pathParams: fastifyRequest.params,
              queryParams: fastifyRequest.query,
              body: fastifyRequest.body,
              headers: fastifyRequest.headers,
            },
          });

          const { statusCode, body: responseBody } = await httpRoute.handler({
            body: fastifyRequest.body,
            pathParams: fastifyRequest.params,
            queryParams: fastifyRequest.query,
          });

          fastifyReply.status(statusCode);

          if (responseBody) {
            fastifyReply.header(HttpHeader.contentType, 'application/json');

            fastifyReply.send(responseBody);
          } else {
            fastifyReply.send();
          }

          this.loggerService.info({
            message: 'Sent an HTTP response.',
            context: {
              source: HttpRouter.name,
              path: fastifyRequest.url,
              method,
              statusCode,
              body: responseBody,
              time: new Date().getTime() - requestDate.getTime(),
            },
          });

          return;
        } catch (error) {
          if (error instanceof BaseError) {
            const formattedError: Record<string, unknown> = {
              name: error.name,
              message: error.message,
              context: error.context,
            };

            this.loggerService.error({
              message: 'Caught an error in the HTTP router.',
              context: {
                source: HttpRouter.name,
                error:
                  error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                        context: error.context,
                        stack: error.stack,
                        cause: error.cause,
                      }
                    : undefined,
                path: fastifyRequest.url,
                method,
                statusCode: fastifyReply.statusCode,
                time: new Date().getTime() - requestDate.getTime(),
              },
            });

            if (error instanceof ApplicationError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof DomainError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            fastifyReply.status(HttpStatusCode.internalServerError).send({
              error: formattedError,
            });

            return;
          }

          this.loggerService.error({
            message: 'Caught an unknown error in the HTTP router.',
            context: {
              source: HttpRouter.name,
              error,
              path: fastifyRequest.url,
              method,
              statusCode: fastifyReply.statusCode,
              time: new Date().getTime() - requestDate.getTime(),
            },
          });

          fastifyReply.status(HttpStatusCode.internalServerError).send({
            error: {
              name: 'InternalServerError',
              message: 'Internal server error',
            },
          });

          return;
        }
      };

      this.server.route({
        method,
        url: path,
        handler,
        schema: {
          description,
          tags,
          ...this.mapToFastifySchema(httpRoute.schema),
        },
      });

      this.loggerService.info({
        message: 'Registered an HTTP route.',
        context: {
          source: HttpRouter.name,
          method,
          path,
        },
      });
    });
  }

  private mapToFastifySchema(routeSchema: HttpRouteSchema): FastifySchema {
    const { pathParams, queryParams, body } = routeSchema.request;

    const fastifySchema: FastifySchema = {};

    if (pathParams) {
      fastifySchema.params = pathParams;
    }

    if (queryParams) {
      fastifySchema.querystring = queryParams;
    }

    if (body) {
      fastifySchema.body = body;
    }

    fastifySchema.response = Object.entries(routeSchema.response).reduce((agg, [statusCode, statusCodeSchema]) => {
      return {
        ...agg,
        [statusCode]: statusCodeSchema,
      };
    }, {});

    return fastifySchema;
  }

  private normalizePath(payload: NormalizePathPayload): string {
    const { path } = payload;

    const urlWithoutDoubleSlashes = path.replace(/(\/+)/g, '/');

    const urlWithoutTrailingSlash = urlWithoutDoubleSlashes.replace(/(\/)$/g, '');

    return urlWithoutTrailingSlash;
  }
}
