import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookChangeRequestCommandHandler } from '../../../application/commandHandlers/createBookChangeRequestCommandHandler/createBookChangeRequestCommandHandler.js';
import { type FindBookChangeRequestsQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestsQueryHandler/findBookChangeRequestsQueryHandler.js';
import { mapBookChangeRequestToDto } from '../common/mappers/bookChangeRequestDtoMapper.js';

import {
  type CreateBookChangeRequestBodyDto,
  type CreateBookChangeRequestResponseBodyDto,
  createBookChangeRequestBodyDtoSchema,
  createBookChangeRequestResponseBodyDtoSchema,
} from './schemas/createBookChangeRequestSchema.js';
import {
  type FindBookChangeRequestsResponseBodyDto,
  findBookChangeRequestsResponseBodyDtoSchema,
  findBookChangeRequestsQueryParamsDtoSchema,
  type FindBookChangeRequestsQueryParamsDto,
} from './schemas/findBookChangeRequestsSchema.js';

export class BookChangeRequestHttpController implements HttpController {
  public readonly basePath = '/book-change-requests';
  public readonly tags = ['BookChangeRequest'];

  public constructor(
    private readonly createBookChangeRequestCommandHandler: CreateBookChangeRequestCommandHandler,
    private readonly findBookChangeRequestsQueryHandler: FindBookChangeRequestsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createBookChangeRequest.bind(this),
        schema: {
          request: {
            body: createBookChangeRequestBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              schema: createBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest created',
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: 'Create a BookChangeRequest',
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findBookChangeRequests.bind(this),
        description: 'Find BookChangeRequests',
        schema: {
          request: {
            queryParams: findBookChangeRequestsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBookChangeRequestsResponseBodyDtoSchema,
              description: 'BookChangeRequests found',
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
    ];
  }

  private async createBookChangeRequest(
    request: HttpRequest<CreateBookChangeRequestBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookChangeRequestResponseBodyDto>> {
    const { ...bookChangeRequestData } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookChangeRequest } = await this.createBookChangeRequestCommandHandler.execute({
      ...bookChangeRequestData,
      userId,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: mapBookChangeRequestToDto(bookChangeRequest),
    };
  }

  private async findBookChangeRequests(
    request: HttpRequest<undefined, FindBookChangeRequestsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBookChangeRequestsResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { bookChangeRequests, total } = await this.findBookChangeRequestsQueryHandler.execute({
      userId,
      page,
      pageSize,
    });

    return {
      body: {
        data: bookChangeRequests.map((bookChangeRequest) => mapBookChangeRequestToDto(bookChangeRequest)),
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
