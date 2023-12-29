import {
  createAuthorBodyDTOSchema,
  type CreateAuthorBodyDTO,
  type CreateAuthorResponseBodyDTO,
  createAuthorResponseBodyDTOSchema,
} from './schemas/createAuthorSchema.js';
import {
  deleteAuthorPathParamsDTOSchema,
  deleteAuthorResponseBodyDTOSchema,
  type DeleteAuthorPathParamsDTO,
  type DeleteAuthorResponseBodyDTO,
} from './schemas/deleteAuthorSchema.js';
import {
  findAuthorPathParamsDTOSchema,
  findAuthorResponseBodyDTOSchema,
  type FindAuthorPathParamsDTO,
  type FindAuthorResponseBodyDTO,
} from './schemas/findAuthorSchema.js';
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
import { type CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { type DeleteAuthorCommandHandler } from '../../../application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { type FindAuthorQueryHandler } from '../../../application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler.js';

export class AuthorHttpController implements HttpController {
  public readonly basePath = '/api/authors';

  public constructor(
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
    private readonly deleteAuthorCommandHandler: DeleteAuthorCommandHandler,
    private readonly findAuthorQueryHandler: FindAuthorQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'create',
        handler: this.createAuthor.bind(this),
        schema: {
          request: {
            body: createAuthorBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createAuthorResponseBodyDTOSchema,
              description: 'Author created.',
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Author'],
        description: 'Create author.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findAuthor.bind(this),
        schema: {
          request: {
            pathParams: findAuthorPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAuthorResponseBodyDTOSchema,
              description: 'Author found.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Author'],
        description: 'Find author by id.',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteAuthor.bind(this),
        schema: {
          request: {
            pathParams: deleteAuthorPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteAuthorResponseBodyDTOSchema,
              description: 'Author deleted.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Author'],
        description: 'Delete author.',
      }),
    ];
  }

  private async createAuthor(
    request: HttpRequest<CreateAuthorBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateAuthorResponseBodyDTO> | HttpUnprocessableEntityResponse<ResponseErrorBody>> {
    try {
      const { firstName, lastName } = request.body;

      await this.accessControlService.verifyBearerToken({
        authorizationHeader: request.headers['authorization'],
      });

      const { author } = await this.createAuthorCommandHandler.execute({
        firstName,
        lastName,
      });

      return {
        statusCode: HttpStatusCode.created,
        body: {
          firstName: author.getFirstName(),
          id: author.getId(),
          lastName: author.getLastName(),
        },
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

  private async findAuthor(
    request: HttpRequest<undefined, undefined, FindAuthorPathParamsDTO>,
  ): Promise<
    | HttpOkResponse<FindAuthorResponseBodyDTO>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    try {
      const { author } = await this.findAuthorQueryHandler.execute({ authorId: id });

      return {
        statusCode: HttpStatusCode.ok,
        body: {
          firstName: author.getFirstName(),
          id: author.getId(),
          lastName: author.getLastName(),
        },
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

  private async deleteAuthor(
    request: HttpRequest<undefined, undefined, DeleteAuthorPathParamsDTO>,
  ): Promise<
    | HttpNoContentResponse<DeleteAuthorResponseBodyDTO>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    try {
      await this.deleteAuthorCommandHandler.execute({ authorId: id });
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
