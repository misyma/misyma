import { UserRole } from '@common/contracts';

import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse, type HttpNoContentResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type ApplyBookChangeRequestCommandHandler } from '../../../application/commandHandlers/applyBookChangeRequestCommandHandler/applyBookChangeRequestCommandHandler.js';
import { type DeleteBookChangeRequestCommandHandler } from '../../../application/commandHandlers/deleteBookChangeRequestCommandHandler/deleteBookChangeRequestCommandHandler.js';
import { type FindBookChangeRequestsQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestsQueryHandler/findBookChangeRequestsQueryHandler.js';
import { mapBookChangeRequestToDto } from '../common/mappers/bookChangeRequestDtoMapper.js';

import {
  type ApplyBookChangeRequestPathParamsDto,
  type ApplyBookChangeRequestResponseBodyDto,
  applyBookChangeRequestPathParamsDtoSchema,
  applyBookChangeRequestResponseBodyDtoSchema,
} from './schemas/applyBookChangeRequestSchema.js';
import {
  deleteBookChangeRequestPathParamsDtoSchema,
  deleteBookChangeRequestResponseBodyDtoSchema,
  type DeleteBookChangeRequestPathParamsDto,
  type DeleteBookChangeRequestResponseBodyDto,
} from './schemas/deleteBookChangeRequestSchema.js';
import {
  type FindAdminBookChangeRequestResponseBodyDto,
  findAdminBookChangeRequestResponseBodyDtoSchema,
  findBookChangeRequestPathParamsDtoSchema,
  type FindBookChangeRequestPathParamsDto,
} from './schemas/findBookChangeRequestSchema.js';
import {
  type FindAdminBookChangeRequestsQueryParamsDto,
  type FindAdminBookChangeRequestsResponseBodyDto,
  findAdminBookChangeRequestsQueryParamsDtoSchema,
  findAdminBookChangeRequestsResponseBodyDtoSchema,
} from './schemas/findBookChangeRequestsSchema.js';

export class BookChangeRequestAdminHttpController implements HttpController {
  public readonly basePath = '/admin/book-change-requests';
  public readonly tags = ['BookChangeRequest'];

  public constructor(
    private readonly applyBookChangeRequestCommandHandler: ApplyBookChangeRequestCommandHandler,
    private readonly deleteBookChangeRequestCommandHandler: DeleteBookChangeRequestCommandHandler,
    private readonly findBookChangeRequestsQueryHandler: FindBookChangeRequestsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':bookChangeRequestId',
        handler: this.deleteBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: deleteBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              schema: deleteBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete bookChangeRequest',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: ':bookChangeRequestId/apply',
        description: 'Apply a BookChangeRequest to the Book',
        handler: this.updateBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: applyBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'BookChangeRequest applied to the Book',
              schema: applyBookChangeRequestResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findBookChangeRequests.bind(this),
        description: 'Find bookChangeRequests',
        schema: {
          request: {
            queryParams: findAdminBookChangeRequestsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findAdminBookChangeRequestsResponseBodyDtoSchema,
              description: 'BookChangeRequests found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: ':bookChangeRequestId',
        handler: this.findBookChangeRequest.bind(this),
        description: 'Find bookChangeRequest by id',
        schema: {
          request: {
            pathParams: findBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findAdminBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async deleteBookChangeRequest(
    request: HttpRequest<undefined, undefined, DeleteBookChangeRequestPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookChangeRequestResponseBodyDto>> {
    const { bookChangeRequestId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    await this.deleteBookChangeRequestCommandHandler.execute({ bookChangeRequestId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private async updateBookChangeRequest(
    request: HttpRequest<undefined, undefined, ApplyBookChangeRequestPathParamsDto>,
  ): Promise<HttpOkResponse<ApplyBookChangeRequestResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { bookChangeRequestId } = request.pathParams;

    await this.applyBookChangeRequestCommandHandler.execute({ bookChangeRequestId });

    return {
      statusCode: httpStatusCodes.ok,
      body: null,
    };
  }

  private async findBookChangeRequests(
    request: HttpRequest<undefined, FindAdminBookChangeRequestsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAdminBookChangeRequestsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { page = 1, pageSize = 10, sortDate } = request.queryParams;

    const { bookChangeRequests, total } = await this.findBookChangeRequestsQueryHandler.execute({
      page,
      pageSize,
      sortDate,
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

  private async findBookChangeRequest(
    request: HttpRequest<undefined, undefined, FindBookChangeRequestPathParamsDto>,
  ): Promise<HttpOkResponse<FindAdminBookChangeRequestResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { bookChangeRequestId } = request.pathParams;

    const { bookChangeRequests } = await this.findBookChangeRequestsQueryHandler.execute({
      page: 1,
      pageSize: 1,
      id: bookChangeRequestId,
    });

    return {
      body: {
        data: bookChangeRequests[0] ? mapBookChangeRequestToDto(bookChangeRequests[0]) : undefined,
      },
      statusCode: httpStatusCodes.ok,
    };
  }
}
