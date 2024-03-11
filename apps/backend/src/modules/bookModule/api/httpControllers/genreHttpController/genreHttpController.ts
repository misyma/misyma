import { type GenreDTO } from './schemas/dtos/genreDTO.js';
import {
  type FindGenreByIdResponseBodyDTO,
  type FindGenreByIdPathParamsDTO,
  findGenreByIdResponseBodyDTOSchema,
  findGenreByIdPathParamsDTOSchema,
} from './schemas/findGenreByIdSchema.js';
import {
  type FindGenreByNameResponseBodyDTO,
  type FindGenreByNameQueryParamsDTO,
  findGenreByNameResponseBodyDTOSchema,
  findGenreByNameQueryParamsDTOSchema,
} from './schemas/findGenreByNameSchema.js';
import { type FindGenresResponseBodyDTO, findGenresResponseBodyDTOSchema } from './schemas/findGenresSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindGenreByIdQueryHandler } from '../../../application/queryHandlers/findGenreByIdQueryHandler/findGenreByIdQueryHandler.js';
import { type FindGenreByNameQueryHandler } from '../../../application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandler.js';
import { type FindGenresQueryHandler } from '../../../application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';

export class GenreHttpController implements HttpController {
  public basePath = '/api/genres';
  public tags = ['Genre'];

  public constructor(
    private readonly findGenresQueryHandler: FindGenresQueryHandler,
    private readonly findGenreByNameQueryHandler: FindGenreByNameQueryHandler,
    private readonly findGenreByIdQueryHandler: FindGenreByIdQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Find genres.',
        handler: this.findGenres.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genres found.',
              schema: findGenresResponseBodyDTOSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
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
              schema: findGenreByNameResponseBodyDTOSchema,
            },
          },
        },
        path: '/name',
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Find genre by id.',
        handler: this.findGenreById.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {
            pathParams: findGenreByIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genre found.',
              schema: findGenreByIdResponseBodyDTOSchema,
            },
          },
        },
        path: ':id',
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async findGenres(request: HttpRequest): Promise<HttpOkResponse<FindGenresResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { genres } = await this.findGenresQueryHandler.execute();

    return {
      body: {
        data: genres.map(this.mapGenreToDTO),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async findGenreByName(
    request: HttpRequest<null, FindGenreByNameQueryParamsDTO>,
  ): Promise<HttpOkResponse<FindGenreByNameResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name } = request.queryParams;

    const { genre } = await this.findGenreByNameQueryHandler.execute({ name });

    return {
      body: this.mapGenreToDTO(genre),
      statusCode: HttpStatusCode.ok,
    };
  }

  private async findGenreById(
    request: HttpRequest<null, null, FindGenreByIdPathParamsDTO>,
  ): Promise<HttpOkResponse<FindGenreByIdResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { genre } = await this.findGenreByIdQueryHandler.execute({ id });

    return {
      body: this.mapGenreToDTO(genre),
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
