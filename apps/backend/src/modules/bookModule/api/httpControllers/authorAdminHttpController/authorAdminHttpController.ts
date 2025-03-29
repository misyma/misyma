import { UserRole } from '@common/contracts';

import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpOkResponse,
  type HttpCreatedResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { type DeleteAuthorCommandHandler } from '../../../application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { type UpdateAuthorCommandHandler } from '../../../application/commandHandlers/updateAuthorCommandHandler/updateAuthorCommandHandler.js';
import { type FindAuthorsQueryHandler } from '../../../application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler.js';
import { mapAuthorToDto } from '../common/mappers/authorDtoMapper.js';

import {
  createAuthorBodyDtoSchema,
  type CreateAuthorBodyDto,
  type CreateAuthorResponseBodyDto,
  createAuthorResponseBodyDtoSchema,
} from './schemas/createAuthorSchema.js';
import {
  deleteAuthorPathParamsDtoSchema,
  deleteAuthorResponseBodyDtoSchema,
  type DeleteAuthorPathParamsDto,
  type DeleteAuthorResponseBodyDto,
} from './schemas/deleteAuthorSchema.js';
import {
  findAdminAuthorsQueryParamsDtoSchema,
  findAdminAuthorsResponseBodyDtoSchema,
  type FindAdminAuthorsQueryParamsDto,
  type FindAdminAuthorsResponseBodyDto,
} from './schemas/findAdminAuthorsSchema.js';
import {
  updateAuthorPathParamsDtoSchema,
  updateAuthorBodyDtoSchema,
  updateAuthorResponseBodyDtoSchema,
  type UpdateAuthorBodyDto,
  type UpdateAuthorPathParamsDto,
  type UpdateAuthorResponseBodyDto,
} from './schemas/updateAuthorSchema.js';

export class AuthorAdminHttpController implements HttpController {
  public readonly basePath = '/admin/authors';
  public readonly tags = ['Author'];

  public constructor(
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
    private readonly updateAuthorCommandHandler: UpdateAuthorCommandHandler,
    private readonly deleteAuthorCommandHandler: DeleteAuthorCommandHandler,
    private readonly findAuthorsQueryHandler: FindAuthorsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createAuthor.bind(this),
        schema: {
          request: {
            body: createAuthorBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              schema: createAuthorResponseBodyDtoSchema,
              description: 'Author created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create author',
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findAuthors.bind(this),
        schema: {
          request: {
            queryParams: findAdminAuthorsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findAdminAuthorsResponseBodyDtoSchema,
              description: 'Authors found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find authors',
      }),
      new HttpRoute({
        description: 'Update Author',
        handler: this.updateAuthor.bind(this),
        method: httpMethodNames.patch,
        path: ':authorId',
        schema: {
          request: {
            pathParams: updateAuthorPathParamsDtoSchema,
            body: updateAuthorBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Author updated',
              schema: updateAuthorResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':authorId',
        handler: this.deleteAuthor.bind(this),
        schema: {
          request: {
            pathParams: deleteAuthorPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              schema: deleteAuthorResponseBodyDtoSchema,
              description: 'Author deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete author',
      }),
    ];
  }

  private async createAuthor(
    request: HttpRequest<CreateAuthorBodyDto>,
  ): Promise<HttpCreatedResponse<CreateAuthorResponseBodyDto>> {
    const { name } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { author } = await this.createAuthorCommandHandler.execute({
      name,
      isApproved: true,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: mapAuthorToDto(author),
    };
  }

  private async findAuthors(
    request: HttpRequest<undefined, FindAdminAuthorsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAdminAuthorsResponseBodyDto>> {
    const { name, ids, page = 1, pageSize = 10, sortField, sortOrder, isApproved } = request.queryParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { authors, total } = await this.findAuthorsQueryHandler.execute({
      name,
      ids,
      isApproved,
      page,
      pageSize,
      sortField,
      sortOrder,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: {
        data: authors.map(mapAuthorToDto),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async updateAuthor(
    request: HttpRequest<UpdateAuthorBodyDto, null, UpdateAuthorPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateAuthorResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { authorId } = request.pathParams;

    const { name, isApproved } = request.body;

    const { author } = await this.updateAuthorCommandHandler.execute({
      id: authorId,
      name,
      isApproved,
    });

    return {
      body: mapAuthorToDto(author),
      statusCode: httpStatusCodes.ok,
    };
  }

  private async deleteAuthor(
    request: HttpRequest<undefined, undefined, DeleteAuthorPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteAuthorResponseBodyDto>> {
    const { authorId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    await this.deleteAuthorCommandHandler.execute({ authorId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }
}
