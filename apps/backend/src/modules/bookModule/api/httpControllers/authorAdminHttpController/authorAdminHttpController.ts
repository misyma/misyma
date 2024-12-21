import { UserRole } from '@common/contracts';

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
  updateAuthorPathParamsDtoSchema,
  updateAuthorBodyDtoSchema,
  updateAuthorResponseBodyDtoSchema,
  type UpdateAuthorBodyDto,
  type UpdateAuthorPathParamsDto,
  type UpdateAuthorResponseBodyDto,
} from './schemas/updateAuthorSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpOkResponse,
  type HttpCreatedResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type AuthorDto } from '../../../../bookModule/api/httpControllers/common/authorDto.js';
import { type CreateAuthorCommandHandler } from '../../../application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler.js';
import { type DeleteAuthorCommandHandler } from '../../../application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler.js';
import { type UpdateAuthorCommandHandler } from '../../../application/commandHandlers/updateAuthorCommandHandler/updateAuthorCommandHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export class AuthorAdminHttpController implements HttpController {
  public readonly basePath = '/admin/authors';
  public readonly tags = ['Author'];

  public constructor(
    private readonly createAuthorCommandHandler: CreateAuthorCommandHandler,
    private readonly updateAuthorCommandHandler: UpdateAuthorCommandHandler,
    private readonly deleteAuthorCommandHandler: DeleteAuthorCommandHandler,
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
        description: 'Update Author',
        handler: this.updateAuthor.bind(this),
        method: HttpMethodName.patch,
        path: ':authorId',
        schema: {
          request: {
            pathParams: updateAuthorPathParamsDtoSchema,
            body: updateAuthorBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Author updated',
              schema: updateAuthorResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':authorId',
        handler: this.deleteAuthor.bind(this),
        schema: {
          request: {
            pathParams: deleteAuthorPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
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
      statusCode: HttpStatusCode.created,
      body: this.mapAuthorToDto(author),
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
      body: this.mapAuthorToDto(author),
      statusCode: HttpStatusCode.ok,
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
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapAuthorToDto(author: Author): AuthorDto {
    return {
      id: author.getId(),
      name: author.getName(),
      isApproved: author.getIsApproved(),
      createdAt: author.getCreatedAt().toISOString(),
    };
  }
}
