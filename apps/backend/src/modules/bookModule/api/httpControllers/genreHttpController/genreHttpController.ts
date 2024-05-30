import {
  type FindGenreByNameResponseBodyDto,
  type FindGenreByNamePathParamsDto,
  findGenreByNameResponseBodyDtoSchema,
  findGenreByNamePathParamsDtoSchema,
} from './schemas/findGenreByNameSchema.js';
import {
  type FindGenresResponseBodyDto,
  findGenresResponseBodyDtoSchema,
  type FindGenresQueryParamsDto,
  findGenresQueryParamsDtoSchema,
} from './schemas/findGenresSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindGenreByNameQueryHandler } from '../../../application/queryHandlers/findGenreByNameQueryHandler/findGenreByNameQueryHandler.js';
import { type FindGenresQueryHandler } from '../../../application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { type Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreDto } from '../common/genreDto.js';

export class GenreHttpController implements HttpController {
  public basePath = '/api/genres';
  public tags = ['Genre'];

  public constructor(
    private readonly findGenresQueryHandler: FindGenresQueryHandler,
    private readonly findGenreByNameQueryHandler: FindGenreByNameQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Find genres',
        handler: this.findGenres.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {
            queryParams: findGenresQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genres found',
              schema: findGenresResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Find genre by name',
        handler: this.findGenreByName.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {
            pathParams: findGenreByNamePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Genre found',
              schema: findGenreByNameResponseBodyDtoSchema,
            },
          },
        },
        path: ':name',
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async findGenres(
    request: HttpRequest<undefined, FindGenresQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindGenresResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { genres, total } = await this.findGenresQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      body: {
        data: genres.map(this.mapGenreToDto),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async findGenreByName(
    request: HttpRequest<undefined, undefined, FindGenreByNamePathParamsDto>,
  ): Promise<HttpOkResponse<FindGenreByNameResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name } = request.pathParams;

    const { genre } = await this.findGenreByNameQueryHandler.execute({ name });

    return {
      body: this.mapGenreToDto(genre),
      statusCode: HttpStatusCode.ok,
    };
  }

  private mapGenreToDto(genre: Genre): GenreDto {
    return {
      id: genre.getId(),
      name: genre.getName(),
    };
  }
}
