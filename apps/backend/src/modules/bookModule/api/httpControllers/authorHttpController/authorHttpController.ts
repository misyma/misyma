import {
  createAuthorBodyDtoSchema,
  type CreateAuthorBodyDto,
  type CreateAuthorResponseBodyDto,
  createAuthorResponseBodyDtoSchema,
} from './schemas/createAuthorSchema.js';
import {
  findAuthorPathParamsDtoSchema,
  findAuthorResponseBodyDtoSchema,
  type FindAuthorPathParamsDto,
  type FindAuthorResponseBodyDto,
} from './schemas/findAuthorSchema.js';
import {
  type FindAuthorsQueryParamsDto,
  type FindAuthorsResponseBodyDto,
  findAuthorsQueryParamsDtoSchema,
  findAuthorsResponseBodyDtoSchema,
} from './schemas/findAuthorsSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type AuthorDto } from '../../../../bookModule/api/httpControllers/common/authorDto.js';
import { type CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { type FindAuthorQueryHandler } from '../../../application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler.js';
import { type FindAuthorsQueryHandler } from '../../../application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export class AuthorHttpController implements HttpController {
  public readonly basePath = '/api/authors';
  public readonly tags = ['Author'];

  public constructor(
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
    private readonly findAuthorQueryHandler: FindAuthorQueryHandler,
    private readonly findAuthorsQueryHandler: FindAuthorsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createAuthor.bind(this),
        schema: {
          request: {
            body: createAuthorBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createAuthorResponseBodyDtoSchema,
              description: 'Author created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create author',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findAuthor.bind(this),
        schema: {
          request: {
            pathParams: findAuthorPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAuthorResponseBodyDtoSchema,
              description: 'Author found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find author by id',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findAuthors.bind(this),
        schema: {
          request: {
            queryParams: findAuthorsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
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
      authorizationHeader: request.headers['authorization'],
    });

    const { author } = await this.createAuthorCommandHandler.execute({
      name,
      isApproved: false,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapAuthorToDto(author),
    };
  }

  private async findAuthor(
    request: HttpRequest<undefined, undefined, FindAuthorPathParamsDto>,
  ): Promise<HttpOkResponse<FindAuthorResponseBodyDto>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { author } = await this.findAuthorQueryHandler.execute({ authorId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapAuthorToDto(author),
    };
  }

  private async findAuthors(
    request: HttpRequest<undefined, FindAuthorsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAuthorsResponseBodyDto>> {
    const { name, page = 1, pageSize = 10 } = request.queryParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { authors, total } = await this.findAuthorsQueryHandler.execute({
      name,
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: authors.map(this.mapAuthorToDto),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private mapAuthorToDto(author: Author): AuthorDto {
    return {
      id: author.getId(),
      name: author.getName(),
      isApproved: author.getIsApproved(),
    };
  }
}
