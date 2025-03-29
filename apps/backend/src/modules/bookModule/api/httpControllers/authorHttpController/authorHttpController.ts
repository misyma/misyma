import { FindAuthorsSortField } from '@common/contracts';

import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { type FindAuthorsQueryHandler } from '../../../application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler.js';
import { mapAuthorToDto } from '../common/mappers/authorDtoMapper.js';

import {
  createAuthorBodyDtoSchema,
  type CreateAuthorBodyDto,
  type CreateAuthorResponseBodyDto,
  createAuthorResponseBodyDtoSchema,
} from './schemas/createAuthorSchema.js';
import {
  type FindAuthorsQueryParamsDto,
  type FindAuthorsResponseBodyDto,
  findAuthorsQueryParamsDtoSchema,
  findAuthorsResponseBodyDtoSchema,
} from './schemas/findAuthorsSchema.js';

export class AuthorHttpController implements HttpController {
  public readonly basePath = '/authors';
  public readonly tags = ['Author'];

  public constructor(
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
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
            queryParams: findAuthorsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findAuthorsResponseBodyDtoSchema,
              description: 'Authors found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find authors',
      }),
    ];
  }

  private async createAuthor(
    request: HttpRequest<CreateAuthorBodyDto>,
  ): Promise<HttpCreatedResponse<CreateAuthorResponseBodyDto>> {
    const { name } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { author } = await this.createAuthorCommandHandler.execute({
      name,
      isApproved: false,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: mapAuthorToDto(author),
    };
  }

  private async findAuthors(
    request: HttpRequest<undefined, FindAuthorsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAuthorsResponseBodyDto>> {
    const { name, page = 1, pageSize = 10, userId, bookshelfId, ids, sortDate } = request.queryParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    const sortFields = sortDate
      ? {
          sortField: FindAuthorsSortField.createdAt,
          sortOrder: sortDate,
        }
      : {};

    const { authors, total } = await this.findAuthorsQueryHandler.execute({
      ids,
      name,
      userId,
      bookshelfId,
      page,
      pageSize,
      ...sortFields,
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
}
