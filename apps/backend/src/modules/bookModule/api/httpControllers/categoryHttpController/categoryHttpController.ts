import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindCategoriesQueryHandler } from '../../../application/queryHandlers/findCategoriesQueryHandler/findCategoriesQueryHandler.js';
import { mapCategoryToDto } from '../common/mappers/categoryDtoMapper.js';

import {
  type FindCategoriesResponseBodyDto,
  findCategoriesResponseBodyDtoSchema,
  type FindCategoriesQueryParamsDto,
  findCategoriesQueryParamsDtoSchema,
} from './schemas/findCategoriesSchema.js';

export class CategoryHttpController implements HttpController {
  public basePath = '/categories';
  public tags = ['Category'];

  public constructor(
    private readonly findCategoriesQueryHandler: FindCategoriesQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Find categories',
        handler: this.findCategories.bind(this),
        method: httpMethodNames.get,
        schema: {
          request: {
            queryParams: findCategoriesQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Categories found',
              schema: findCategoriesResponseBodyDtoSchema,
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
    ];
  }

  private async findCategories(
    request: HttpRequest<undefined, FindCategoriesQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindCategoriesResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { categories, total } = await this.findCategoriesQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      body: {
        data: categories.map(mapCategoryToDto),
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
