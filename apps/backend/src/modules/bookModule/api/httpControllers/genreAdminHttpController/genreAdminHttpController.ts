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
import { type CreateGenreCommandHandler } from '../../../application/commandHandlers/createGenreCommandHandler/createGenreCommandHandler.js';
import { type DeleteGenreCommandHandler } from '../../../application/commandHandlers/deleteGenreCommandHandler/deleteGenreCommandHandler.js';
import { type UpdateGenreCommandHandler } from '../../../application/commandHandlers/updateGenreCommandHandler/updateGenreCommandHandler.js';
import { mapGenreToDto } from '../common/mappers/genreDtoMapper.js';

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
  type UpdateGenreBodyDto,
  type UpdateGenreResponseBodyDto,
  type UpdateGenrePathParamsDto,
  updateGenreBodyDtoSchema,
  updateGenreResponseBodyDtoSchema,
  updateGenrePathParamsDtoSchema,
} from './schema/updateGenreSchema.js';

export class GenreAdminHttpController implements HttpController {
  public readonly basePath = '/admin/genres';
  public readonly tags = ['Genre'];

  public constructor(
    private readonly createGenreCommandHandler: CreateGenreCommandHandler,
    private readonly updateGenreCommandHandler: UpdateGenreCommandHandler,
    private readonly deleteGenreCommandHandler: DeleteGenreCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Create genre',
        handler: this.createGenre.bind(this),
        method: httpMethodNames.post,
        schema: {
          request: {
            body: createGenreBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'Genre created',
              schema: createGenreResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Update Genre',
        handler: this.updateGenre.bind(this),
        method: httpMethodNames.patch,
        schema: {
          request: {
            pathParams: updateGenrePathParamsDtoSchema,
            body: updateGenreBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Genre updated',
              schema: updateGenreResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        path: ':genreId',
      }),
      new HttpRoute({
        description: 'Delete genre',
        handler: this.deleteGenre.bind(this),
        method: httpMethodNames.delete,
        schema: {
          request: {
            pathParams: deleteGenrePathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'Genre deleted',
              schema: deleteGenreResponseBodyDtoSchema,
            },
          },
        },
        path: ':genreId',
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async createGenre(
    request: HttpRequest<CreateGenreBodyDto>,
  ): Promise<HttpCreatedResponse<CreateGenreResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { name } = request.body;

    const { genre } = await this.createGenreCommandHandler.execute({ name });

    return {
      body: mapGenreToDto(genre),
      statusCode: httpStatusCodes.created,
    };
  }

  private async updateGenre(
    request: HttpRequest<UpdateGenreBodyDto, null, UpdateGenrePathParamsDto>,
  ): Promise<HttpOkResponse<UpdateGenreResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { genreId } = request.pathParams;

    const { name } = request.body;

    const { genre } = await this.updateGenreCommandHandler.execute({
      id: genreId,
      name,
    });

    return {
      body: mapGenreToDto(genre),
      statusCode: httpStatusCodes.ok,
    };
  }

  private async deleteGenre(
    request: HttpRequest<null, null, DeleteGenrePathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteGenreResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { genreId } = request.pathParams;

    await this.deleteGenreCommandHandler.execute({ id: genreId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }
}
