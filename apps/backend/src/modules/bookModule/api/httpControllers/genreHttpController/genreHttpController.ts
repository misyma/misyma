import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindGenresQueryHandler } from '../../../application/queryHandlers/findGenresQueryHandler/findGenresQueryHandler.js';
import { mapGenreToDto } from '../common/mappers/genreDtoMapper.js';

import {
  type FindGenresResponseBodyDto,
  findGenresResponseBodyDtoSchema,
  type FindGenresQueryParamsDto,
  findGenresQueryParamsDtoSchema,
} from './schemas/findGenresSchema.js';

export class GenreHttpController implements HttpController {
  public basePath = '/genres';
  public tags = ['Genre'];

  public constructor(
    private readonly findGenresQueryHandler: FindGenresQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Find genres',
        handler: this.findGenres.bind(this),
        method: httpMethodNames.get,
        schema: {
          request: {
            queryParams: findGenresQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Genres found',
              schema: findGenresResponseBodyDtoSchema,
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
    ];
  }

  private async findGenres(
    request: HttpRequest<undefined, FindGenresQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindGenresResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { genres, total } = await this.findGenresQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      body: {
        data: genres.map(mapGenreToDto),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: httpStatusCodes.ok,
    };
  }
}
