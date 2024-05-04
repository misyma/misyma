import { UserRole } from '@common/contracts';

import {
  type CreateGenreBodyDto,
  type CreateGenreResponseBodyDto,
  createGenreBodyDtoSchema,
  createGenreResponseBodyDtoSchema,
} from './schema/createGenreSchema.js';
import {
  type DeleteGenrePathParamsDto,
  deleteGenreResponseBodyDtoSchema,
  deleteGenrePathParamsDtoSchema,
  type DeleteGenreResponseBodyDto,
} from './schema/deleteGenreSchema.js';
import {
  type UpdateGenreNameBodyDto,
  type UpdateGenreNameResponseBodyDto,
  type UpdateGenreNamePathParamsDto,
  updateGenreNameBodyDtoSchema,
  updateGenreNameResponseBodyDtoSchema,
  updateGenreNamePathParamsDtoSchema,
} from './schema/updateGenreNameSchema.js';
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
import { type CreateGenreCommandHandler } from '../../../application/commandHandlers/createGenreCommandHandler/createGenreCommandHandler.js';
import { type DeleteGenreCommandHandler } from '../../../application/commandHandlers/deleteGenreCommandHandler/deleteGenreCommandHandler.js';
import { type UpdateGenreNameCommandHandler } from '../../../application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreDto } from '../common/genreDto.js';

export class GenreAdminHttpController implements HttpController {
  public readonly basePath = '/api/admin/genres';
  public readonly tags = ['Genre'];

  public constructor(
    private readonly createGenreCommandHandler: CreateGenreCommandHandler,
    private readonly updateGenreNameCommandHandler: UpdateGenreNameCommandHandler,
    private readonly deleteGenreCommandHandler: DeleteGenreCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Create genre',
        handler: this.createGenre.bind(this),
        method: HttpMethodName.post,
        schema: {
          request: {
            body: createGenreBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Genre created',
              schema: createGenreResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Update Genre name',
        handler: this.updateGenreName.bind(this),
        method: HttpMethodName.patch,
        schema: {
          request: {
            pathParams: updateGenreNamePathParamsDtoSchema,
            body: updateGenreNameBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genre name updated',
              schema: updateGenreNameResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        path: ':id/name',
      }),
      new HttpRoute({
        description: 'Delete genre',
        handler: this.deleteGenre.bind(this),
        method: HttpMethodName.delete,
        schema: {
          request: {
            pathParams: deleteGenrePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Genre deleted',
              schema: deleteGenreResponseBodyDtoSchema,
            },
          },
        },
        path: ':id',
      }),
    ];
  }

  private async createGenre(
    request: HttpRequest<CreateGenreBodyDto>,
  ): Promise<HttpCreatedResponse<CreateGenreResponseBodyDto>> {
    this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { name } = request.body;

    const { genre } = await this.createGenreCommandHandler.execute({ name });

    return {
      body: this.mapGenreToDto(genre),
      statusCode: HttpStatusCode.created,
    };
  }

  private async updateGenreName(
    request: HttpRequest<UpdateGenreNameBodyDto, null, UpdateGenreNamePathParamsDto>,
  ): Promise<HttpOkResponse<UpdateGenreNameResponseBodyDto>> {
    this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { id } = request.pathParams;

    const { name } = request.body;

    const { genre } = await this.updateGenreNameCommandHandler.execute({
      id,
      name,
    });

    return {
      body: this.mapGenreToDto(genre),
      statusCode: HttpStatusCode.ok,
    };
  }

  private async deleteGenre(
    request: HttpRequest<null, null, DeleteGenrePathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteGenreResponseBodyDto>> {
    this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { id } = request.pathParams;

    await this.deleteGenreCommandHandler.execute({ id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapGenreToDto(genre: Genre): GenreDto {
    return {
      id: genre.getId(),
      name: genre.getName(),
    };
  }
}
