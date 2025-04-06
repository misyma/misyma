import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type FindBookQueryHandler } from '../../../application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { type FindBooksQueryHandler } from '../../../application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler.js';
import { mapBookToDto } from '../common/mappers/bookDtoMapper.js';

import {
  type CreateBookBodyDto,
  type CreateBookResponseBodyDto,
  createBookBodyDtoSchema,
  createBookResponseBodyDtoSchema,
} from './schemas/createBookSchema.js';
import {
  findBookResponseBodyDtoSchema,
  type FindBookResponseBodyDto,
  type FindBookPathParamsDto,
  findBookPathParamsDtoSchema,
} from './schemas/findBookSchema.js';
import {
  type FindBooksResponseBodyDto,
  findBooksResponseBodyDtoSchema,
  findBooksQueryParamsDtoSchema,
  type FindBooksQueryParamsDto,
} from './schemas/findBooksSchema.js';

export class BookHttpController implements HttpController {
  public readonly basePath = '/books';
  public readonly tags = ['Book'];

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly findBookQueryHandler: FindBookQueryHandler,
    private readonly findBooksQueryHandler: FindBooksQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              schema: createBookResponseBodyDtoSchema,
              description: 'Draft book created',
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: 'Create draft book',
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: ':bookId',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBookResponseBodyDtoSchema,
              description: 'Book found',
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: 'Find book by id',
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findBooks.bind(this),
        description: 'Find books',
        schema: {
          request: {
            queryParams: findBooksQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBooksResponseBodyDtoSchema,
              description: 'Books found',
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDto>> {
    const { authorIds, ...bookData } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { book } = await this.createBookCommandHandler.execute({
      ...bookData,
      authorIds,
      isApproved: false,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: mapBookToDto(book),
    };
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookResponseBodyDto>> {
    const { bookId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { book } = await this.findBookQueryHandler.execute({ bookId });

    return {
      statusCode: httpStatusCodes.ok,
      body: mapBookToDto(book),
    };
  }

  private async findBooks(
    request: HttpRequest<undefined, FindBooksQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBooksResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { isbn, title, page = 1, pageSize = 10, sortField, sortOrder } = request.queryParams;

    const { books, total } = await this.findBooksQueryHandler.execute({
      isbn,
      title,
      page,
      pageSize,
      isApproved: true,
      sortField,
      sortOrder,
    });

    return {
      body: {
        data: books.map((book) => mapBookToDto(book)),
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
