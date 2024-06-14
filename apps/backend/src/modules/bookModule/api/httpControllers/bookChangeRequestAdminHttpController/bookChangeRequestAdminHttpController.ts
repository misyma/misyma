import { UserRole } from '@common/contracts';

import {
  createBookChangeRequestBodyDtoSchema,
  createBookChangeRequestResponseBodyDtoSchema,
  type CreateBookChangeRequestBodyDto,
  type CreateBookChangeRequestResponseBodyDto,
} from './schemas/createBookChangeRequestSchema.js';
import {
  deleteBookChangeRequestPathParamsDtoSchema,
  deleteBookChangeRequestResponseBodyDtoSchema,
  type DeleteBookChangeRequestPathParamsDto,
  type DeleteBookChangeRequestResponseBodyDto,
} from './schemas/deleteBookChangeRequestSchema.js';
import {
  type FindAdminBookChangeRequestsQueryParamsDto,
  type FindAdminBookChangeRequestsResponseBodyDto,
  findAdminBookChangeRequestsQueryParamsDtoSchema,
  findAdminBookChangeRequestsResponseBodyDtoSchema,
} from './schemas/findBookChangeRequestsSchema.js';
import {
  updateBookChangeRequestPathParamsDtoSchema,
  updateBookChangeRequestBodyDtoSchema,
  type UpdateBookChangeRequestBodyDto,
  type UpdateBookChangeRequestPathParamsDto,
  updateBookChangeRequestResponseBodyDtoSchema,
  type UpdateBookChangeRequestResponseBodyDto,
} from './schemas/updateBookChangeRequestSchema.js';
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
import { type UpdateBookChangeRequestCommandHandler } from '../../../application/commandHandlers/applyBookChangeRequestCommandHandler/applyBookChangeRequestCommandHandler.js';
import { type CreateBookChangeRequestCommandHandler } from '../../../application/commandHandlers/createBookChangeRequestCommandHandler/createBookChangeRequestCommandHandler.js';
import { type DeleteBookChangeRequestCommandHandler } from '../../../application/commandHandlers/deleteBookChangeRequestCommandHandler/deleteBookChangeRequestCommandHandler.js';
import { type FindBookChangeRequestsQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestsQueryHandler/findBookChangeRequestsQueryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestDto } from '../common/bookChangeRequestDto.js';

export class BookChangeRequestAdminHttpController implements HttpController {
  public readonly basePath = '/admin/bookChangeRequests';
  public readonly tags = ['BookChangeRequest'];

  public constructor(
    private readonly createBookChangeRequestCommandHandler: CreateBookChangeRequestCommandHandler,
    private readonly deleteBookChangeRequestCommandHandler: DeleteBookChangeRequestCommandHandler,
    private readonly updateBookChangeRequestCommandHandler: UpdateBookChangeRequestCommandHandler,
    private readonly findBookChangeRequestsQueryHandler: FindBookChangeRequestsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBookChangeRequest.bind(this),
        schema: {
          request: {
            body: createBookChangeRequestBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create bookChangeRequest',
      }),
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
        method: HttpMethodName.patch,
        path: ':bookChangeRequestId',
        description: 'Update a bookChangeRequest',
        handler: this.updateBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: updateBookChangeRequestPathParamsDtoSchema,
            body: updateBookChangeRequestBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'BookChangeRequest updated',
              schema: updateBookChangeRequestResponseBodyDtoSchema,
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
    ];
  }

  private async createBookChangeRequest(
    request: HttpRequest<CreateBookChangeRequestBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookChangeRequestResponseBodyDto>> {
    const { authorIds, ...bookChangeRequestData } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { bookChangeRequest } = await this.createBookChangeRequestCommandHandler.execute({
      ...bookChangeRequestData,
      authorIds,
      isApproved: true,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest),
    };
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
    request: HttpRequest<UpdateBookChangeRequestBodyDto, undefined, UpdateBookChangeRequestPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookChangeRequestResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookChangeRequestId } = request.pathParams;

    const { authorIds, format, imageUrl, language, pages, publisher, releaseYear, title, translator } = request.body;

    const { bookChangeRequest } = await this.updateBookChangeRequestCommandHandler.execute({
      bookChangeRequestId,
      authorIds,
      format,
      imageUrl,
      language,
      pages,
      publisher,
      releaseYear,
      title,
      translator,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest),
    };
  }

  private async findBookChangeRequests(
    request: HttpRequest<undefined, FindAdminBookChangeRequestsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAdminBookChangeRequestsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
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

  private mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest: BookChangeRequest): BookChangeRequestDto {
    const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
      bookChangeRequest.getState();

    const bookChangeRequestDto: BookChangeRequestDto = {
      id: bookChangeRequest.getId(),
      title,
      language,
      format,
      isApproved,
      authors: bookChangeRequest.getAuthors().map((author) => ({
        id: author.getId(),
        name: author.getName(),
        isApproved: author.getIsApproved(),
      })),
    };

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

    return bookChangeRequestDto;
  }
}
