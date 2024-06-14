import {
  type CreateBookChangeRequestBodyDto,
  type CreateBookChangeRequestResponseBodyDto,
  createBookChangeRequestBodyDtoSchema,
  createBookChangeRequestResponseBodyDtoSchema,
} from './schemas/createBookChangeRequestSchema.js';
import {
  findBookChangeRequestResponseBodyDtoSchema,
  type FindBookChangeRequestResponseBodyDto,
  type FindBookChangeRequestPathParamsDto,
  findBookChangeRequestPathParamsDtoSchema,
} from './schemas/findBookChangeRequestSchema.js';
import {
  type FindBookChangeRequestsResponseBodyDto,
  findBookChangeRequestsResponseBodyDtoSchema,
  findBookChangeRequestsQueryParamsDtoSchema,
  type FindBookChangeRequestsQueryParamsDto,
} from './schemas/findBookChangeRequestsSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookChangeRequestCommandHandler } from '../../../application/commandHandlers/createBookChangeRequestCommandHandler/createBookChangeRequestCommandHandler.js';
import { type FindBookChangeRequestQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestQueryHandler/findBookChangeRequestQueryHandler.js';
import { type FindBookChangeRequestsQueryHandler } from '../../../application/queryHandlers/findBookChangeRequestsQueryHandler/findBookChangeRequestsQueryHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestDto } from '../common/bookChangeRequestDto.js';

export class BookChangeRequestHttpController implements HttpController {
  public readonly basePath = '/bookChangeRequests';
  public readonly tags = ['BookChangeRequest'];

  public constructor(
    private readonly createBookChangeRequestCommandHandler: CreateBookChangeRequestCommandHandler,
    private readonly findBookChangeRequestQueryHandler: FindBookChangeRequestQueryHandler,
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
              description: 'Draft bookChangeRequest created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create draft bookChangeRequest',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bookChangeRequestId',
        handler: this.findBookChangeRequest.bind(this),
        schema: {
          request: {
            pathParams: findBookChangeRequestPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookChangeRequestResponseBodyDtoSchema,
              description: 'BookChangeRequest found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find bookChangeRequest by id',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findBookChangeRequests.bind(this),
        description: 'Find bookChangeRequests',
        schema: {
          request: {
            queryParams: findBookChangeRequestsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookChangeRequestsResponseBodyDtoSchema,
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
    });

    const { bookChangeRequest } = await this.createBookChangeRequestCommandHandler.execute({
      ...bookChangeRequestData,
      authorIds,
      isApproved: false,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest),
    };
  }

  private async findBookChangeRequest(
    request: HttpRequest<undefined, undefined, FindBookChangeRequestPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookChangeRequestResponseBodyDto>> {
    const { bookChangeRequestId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookChangeRequest } = await this.findBookChangeRequestQueryHandler.execute({ bookChangeRequestId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest),
    };
  }

  private async findBookChangeRequests(
    request: HttpRequest<undefined, FindBookChangeRequestsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBookChangeRequestsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { isbn, title, page = 1, pageSize = 10 } = request.queryParams;

    const { bookChangeRequests, total } = await this.findBookChangeRequestsQueryHandler.execute({
      isbn,
      title,
      page,
      pageSize,
      isApproved: true,
    });

    return {
      body: {
        data: bookChangeRequests.map((bookChangeRequest) => this.mapBookChangeRequestToBookChangeRequestDto(bookChangeRequest)),
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
