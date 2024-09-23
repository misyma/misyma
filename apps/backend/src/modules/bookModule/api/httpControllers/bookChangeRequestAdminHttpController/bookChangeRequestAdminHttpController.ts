import { UserRole } from '@common/contracts';

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
  type FindAdminBookChangeRequestByIdResponseBodyDto,
  findAdminBookChangeRequestByIdResponseBodyDtoSchema,
  findBookChangeRequestByIdPathParamsDtoSchema,
  type FindBookChangeRequestByIdPathParamsDto,
} from './schemas/findBookChangeRequestByIdSchema.js';
import {
  type FindAdminBookChangeRequestsQueryParamsDto,
  type FindAdminBookChangeRequestsResponseBodyDto,
  findAdminBookChangeRequestsQueryParamsDtoSchema,
  findAdminBookChangeRequestsResponseBodyDtoSchema,
} from './schemas/findBookChangeRequestsSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse, type HttpNoContentResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type ApplyBookChangeRequestCommandHandler } from '../../../application/commandHandlers/applyBookChangeRequestCommandHandler/applyBookChangeRequestCommandHandler.js';
import { type DeleteBookChangeRequestCommandHandler } from '../../../application/commandHandlers/deleteBookChangeRequestCommandHandler/deleteBookChangeRequestCommandHandler.js';
import { type FindBookChangeRequestsQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestsQueryHandler/findBookChangeRequestsQueryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestDto } from '../common/bookChangeRequestDto.js';

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
        method: HttpMethodName.delete,
        path: ':bookChangeRequestId',
        handler: this.deleteBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: deleteBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete bookChangeRequest',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':bookChangeRequestId/apply',
        description: 'Apply a BookChangeRequest to the Book',
        handler: this.updateBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: applyBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'BookChangeRequest applied to the Book',
              schema: applyBookChangeRequestResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findBookChangeRequests.bind(this),
        description: 'Find bookChangeRequests',
        schema: {
          request: {
            queryParams: findAdminBookChangeRequestsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAdminBookChangeRequestsResponseBodyDtoSchema,
              description: 'BookChangeRequests found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findBookChangeRequestsById.bind(this),
        description: 'Find bookChangeRequest by id',
        schema: {
          request: {
            pathParams: findBookChangeRequestByIdPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findAdminBookChangeRequestByIdResponseBodyDtoSchema,
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
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.deleteBookChangeRequestCommandHandler.execute({ bookChangeRequestId });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async updateBookChangeRequest(
    request: HttpRequest<undefined, undefined, ApplyBookChangeRequestPathParamsDto>,
  ): Promise<HttpOkResponse<ApplyBookChangeRequestResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { bookChangeRequestId } = request.pathParams;

    await this.applyBookChangeRequestCommandHandler.execute({ bookChangeRequestId });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async findBookChangeRequests(
    request: HttpRequest<undefined, FindAdminBookChangeRequestsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAdminBookChangeRequestsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { bookChangeRequests, total } = await this.findBookChangeRequestsQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      body: {
        data: bookChangeRequests.map((bookChangeRequest) =>
          this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest),
        ),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async findBookChangeRequestsById(
    request: HttpRequest<undefined, undefined, FindBookChangeRequestByIdPathParamsDto>,
  ): Promise<HttpOkResponse<FindAdminBookChangeRequestByIdResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { id } = request.pathParams;

    const { bookChangeRequests } = await this.findBookChangeRequestsQueryHandler.execute({
      page: 1,
      pageSize: 1,
      id,
    });

    return {
      body: {
        data: bookChangeRequests[0]
          ? this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequests[0])
          : undefined,
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest: BookChangeRequest): BookChangeRequestDto {
    const {
      title,
      language,
      format,
      imageUrl,
      isbn,
      publisher,
      releaseYear,
      translator,
      pages,
      bookId,
      createdAt,
      userEmail,
      authorIds,
      bookTitle,
    } = bookChangeRequest.getState();

    const bookChangeRequestDto: BookChangeRequestDto = {
      id: bookChangeRequest.getId(),
      bookId,
      userEmail,
      createdAt: createdAt.toISOString(),
      bookTitle: bookTitle as string,
    };

    if (authorIds) {
      bookChangeRequestDto.authorIds = authorIds;
    }

    if (isbn) {
      bookChangeRequestDto.isbn = isbn;
    }

    if (publisher) {
      bookChangeRequestDto.publisher = publisher;
    }

    if (releaseYear) {
      bookChangeRequestDto.releaseYear = releaseYear;
    }

    if (translator) {
      bookChangeRequestDto.translator = translator;
    }

    if (pages) {
      bookChangeRequestDto.pages = pages;
    }

    if (imageUrl) {
      bookChangeRequestDto.imageUrl = imageUrl;
    }

    if (title) {
      bookChangeRequestDto.title = title;
    }

    if (language) {
      bookChangeRequestDto.language = language;
    }

    if (format) {
      bookChangeRequestDto.format = format;
    }

    return bookChangeRequestDto;
  }
}
