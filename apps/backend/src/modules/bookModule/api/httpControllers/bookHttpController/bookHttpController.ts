import {
  createBookBodySchema,
  createBookResponseCreatedBodySchema,
  type CreateBookBody,
  type CreateBookResponseCreatedBody,
} from './schemas/createBookSchema.js';
import {
  deleteBookPathParametersSchema,
  deleteBookResponseNoContentBodySchema,
  type DeleteBookPathParameters,
  type DeleteBookResponseNoContentBody,
} from './schemas/deleteBookSchema.js';
import {
  findBookPathParametersSchema,
  findBookResponseOkBodySchema,
  type FindBookPathParameters,
  type FindBookResponseOkBody,
} from './schemas/findBookSchema.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpUnprocessableEntityResponse,
  type HttpOkResponse,
  type HttpNotFoundResponse,
  type HttpForbiddenResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { responseErrorBodySchema, type ResponseErrorBody } from '../../../../../common/types/http/responseErrorBody.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { type FindBookQueryHandler } from '../../../application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export class BookHttpController implements HttpController {
  public readonly basePath = '/api/books';

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    private readonly findBookQueryHandler: FindBookQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'create',
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseCreatedBodySchema,
              description: 'Book created.',
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Create book.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookResponseOkBodySchema,
              description: 'Book found.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Find book by id.',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteBook.bind(this),
        schema: {
          request: {
            pathParams: deleteBookPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookResponseNoContentBodySchema,
              description: 'Book deleted.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Delete book.',
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBody>,
  ): Promise<HttpCreatedResponse<CreateBookResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>> {
    try {
      const { title, releaseYear, authorId } = request.body;

      await this.accessControlService.verifyBearerToken({
        authorizationHeader: request.headers['authorization'],
      });

      const { book } = await this.createBookCommandHandler.execute({
        title,
        releaseYear,
        authorId,
      });

      return {
        statusCode: HttpStatusCode.created,
        body: { book },
      };
    } catch (error) {
      if (error instanceof ResourceAlreadyExistsError) {
        return {
          statusCode: HttpStatusCode.unprocessableEntity,
          body: { error },
        };
      }

      throw error;
    }
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParameters>,
  ): Promise<
    | HttpOkResponse<FindBookResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    try {
      const { book } = await this.findBookQueryHandler.execute({ bookId: id });

      return {
        statusCode: HttpStatusCode.ok,
        body: { book: book as Book },
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteBookResponseNoContentBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    try {
      await this.deleteBookCommandHandler.execute({ bookId: id });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }
}
