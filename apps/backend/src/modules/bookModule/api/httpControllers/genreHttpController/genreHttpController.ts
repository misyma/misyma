import {
  type CreateGenreBodyDTO,
  createGenreCreatedResponseDTOSchema,
  createGenreBodyDTOSchema,
  type CreateGenreCreatedResponseDTO,
} from './schemas/createGenreSchema.js';
import { type GenreDTO } from './schemas/dtos/genreDTO.js';
import {
  type FindGenreByNameOkResponseBodyDTO,
  type FindGenreByNameQueryParamsDTO,
  findGenreByNameOkResponseBodyDTOSchema,
  findGenreByNameQueryParamsDTOSchema,
} from './schemas/findGenreByNameSchema.js';
import { type FindGenresOkResponseDTO, findGenresOkResponseDTOSchema } from './schemas/findGenresSchema.js';
import {
  type UpdateGenreNameBodyDTO,
  type UpdateGenreNamePathParamsDTO,
  updateGenreNameBodyDTOSchema,
  updateGenreNamePathParamsDTOSchema,
  updateGenreNameOkResponseBodyDTOSchema,
  type UpdateGenreNameOkResponseBodyDTO,
} from './schemas/updateGenreNameSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse, type HttpCreatedResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateGenreCommandHandler } from '../../../application/commandHandlers/createGenreCommandHandler/createGenreCommandHandler.js';
import { type UpdateGenreNameCommandHandler } from '../../../application/commandHandlers/updateGenreNameCommandHandler/updateGenreNameCommandHandler.js';
import { type FindGenreByNameQueryHandler } from '../../../application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandler.js';
import { type FindGenresQueryHandler } from '../../../application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

// Idea: Create/Update/Delete(?) methods could be moved to an AdminHttpController
export class GenreHttpController implements HttpController {
  public basePath = '/api/genres';

  public constructor(
    private readonly findGenresQueryHandler: FindGenresQueryHandler,
    private readonly findGenreByNameQueryHandler: FindGenreByNameQueryHandler,
    private readonly createGenreCommandHandler: CreateGenreCommandHandler,
    private readonly updateGenreNameCommandHandler: UpdateGenreNameCommandHandler,
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
              schema: createGenreCreatedResponseDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Genre'],
        path: 'create',
      }),
      new HttpRoute({
        description: 'Find genres.',
        handler: this.findGenres.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genres found.',
              schema: findGenresOkResponseDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Genre'],
      }),
      new HttpRoute({
        description: 'Find genre by name.',
        handler: this.findGenreByName.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {
            queryParams: findGenreByNameQueryParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genre found.',
              schema: findGenreByNameOkResponseBodyDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Genre'],
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
              schema: updateGenreNameOkResponseBodyDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Genre'],
        path: ':id/name',
      }),
    ];
  }

  private async createGenre(
    request: HttpRequest<CreateGenreBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateGenreCreatedResponseDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name } = request.body;

    const { genre } = await this.createGenreCommandHandler.execute({ name });

    return {
      body: {
        genre: this.mapGenreToDTO(genre),
      },
      statusCode: HttpStatusCode.created,
    };
  }

  private async findGenres(request: HttpRequest): Promise<HttpOkResponse<FindGenresOkResponseDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { genres } = await this.findGenresQueryHandler.execute();

    return {
      body: {
        genres: genres.map(this.mapGenreToDTO),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async findGenreByName(
    request: HttpRequest<null, FindGenreByNameQueryParamsDTO>,
  ): Promise<HttpOkResponse<FindGenreByNameOkResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name } = request.queryParams;

    const { genre } = await this.findGenreByNameQueryHandler.execute({ name });

    return {
      body: {
        genre: this.mapGenreToDTO(genre),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async updateGenreName(
    request: HttpRequest<UpdateGenreNameBodyDTO, null, UpdateGenreNamePathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateGenreNameOkResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { name } = request.body;

    const { genre } = await this.updateGenreNameCommandHandler.execute({
      id,
      name,
    });

    return {
      body: {
        genre: this.mapGenreToDTO(genre),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private mapGenreToDTO(genre: Genre): GenreDTO {
    return {
      id: genre.getId(),
      name: genre.getName(),
    };
  }
}
