import {
  type CreateGenreBodyDTO,
  type CreateGenreResponseBodyDTO,
  createGenreBodyDTOSchema,
  createGenreResponseBodyDTOSchema,
} from './schema/createGenreSchema.js';
import {
  type DeleteGenrePathParamsDTO,
  deleteGenreResponseBodyDTOSchema,
  deleteGenrePathParamsDTOSchema,
  type DeleteGenreResponseBodyDTO,
} from './schema/deleteGenreSchema.js';
import {
  type UpdateGenreNameBodyDTO,
  type UpdateGenreNameResponseBodyDTO,
  type UpdateGenreNamePathParamsDTO,
  updateGenreNameBodyDTOSchema,
  updateGenreNameResponseBodyDTOSchema,
  updateGenreNamePathParamsDTOSchema,
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
import { type GenreDTO } from '../genreHttpController/schemas/dtos/genreDTO.js';

export class GenreAdminHttpController implements HttpController {
  public basePath = '/api/admin/genres';
  public tags = ['Genre'];

  public constructor(
    private readonly createGenreCommandHandler: CreateGenreCommandHandler,
    private readonly updateGenreNameCommandHandler: UpdateGenreNameCommandHandler,
    private readonly deleteGenreCommandHandler: DeleteGenreCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Create genre.',
        handler: this.createGenre.bind(this),
        method: HttpMethodName.post,
        schema: {
          request: {
            body: createGenreBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Genre created.',
              schema: createGenreResponseBodyDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.basicAuth,
        path: 'create',
      }),
      new HttpRoute({
        description: 'Update Genre name.',
        handler: this.updateGenreName.bind(this),
        method: HttpMethodName.patch,
        schema: {
          request: {
            pathParams: updateGenreNamePathParamsDTOSchema,
            body: updateGenreNameBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genre name updated.',
              schema: updateGenreNameResponseBodyDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.basicAuth,
        path: ':id/name',
      }),
      new HttpRoute({
        description: 'Delete genre.',
        handler: this.deleteGenre.bind(this),
        method: HttpMethodName.delete,
        schema: {
          request: {
            pathParams: deleteGenrePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Genre deleted.',
              schema: deleteGenreResponseBodyDTOSchema,
            },
          },
        },
        path: ':id',
      }),
    ];
  }

  private async createGenre(
    request: HttpRequest<CreateGenreBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateGenreResponseBodyDTO>> {
    this.accessControlService.verifyBasicAuth({
      authorizationHeader: request.headers['authorization'],
    });

    const { name } = request.body;

    const { genre } = await this.createGenreCommandHandler.execute({ name });

    return {
      body: this.mapGenreToDTO(genre),
      statusCode: HttpStatusCode.created,
    };
  }

  private async updateGenreName(
    request: HttpRequest<UpdateGenreNameBodyDTO, null, UpdateGenreNamePathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateGenreNameResponseBodyDTO>> {
    this.accessControlService.verifyBasicAuth({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { name } = request.body;

    const { genre } = await this.updateGenreNameCommandHandler.execute({
      id,
      name,
    });

    return {
      body: this.mapGenreToDTO(genre),
      statusCode: HttpStatusCode.ok,
    };
  }

  private async deleteGenre(
    request: HttpRequest<null, null, DeleteGenrePathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteGenreResponseBodyDTO>> {
    this.accessControlService.verifyBasicAuth({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    await this.deleteGenreCommandHandler.execute({ id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapGenreToDTO(genre: Genre): GenreDTO {
    return {
      id: genre.getId(),
      name: genre.getName(),
    };
  }
}
