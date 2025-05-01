import { userRoles } from '@common/contracts';

import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpOkResponse,
  type HttpCreatedResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { type UpdateBookCommandHandler } from '../../../application/commandHandlers/updateBookCommandHandler/updateBookCommandHandler.js';
import { type FindBooksQueryHandler } from '../../../application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler.js';
import { mapBookToDto } from '../common/mappers/bookDtoMapper.js';

import {
  createBookBodyDtoSchema,
  createBookResponseBodyDtoSchema,
  type CreateBookBodyDto,
  type CreateBookResponseBodyDto,
} from './schemas/createBookSchema.js';
import {
  deleteBookPathParamsDtoSchema,
  deleteBookResponseBodyDtoSchema,
  type DeleteBookPathParamsDto,
  type DeleteBookResponseBodyDto,
} from './schemas/deleteBookSchema.js';
import {
  type FindAdminBooksQueryParamsDto,
  type FindAdminBooksResponseBodyDto,
  findAdminBooksQueryParamsDtoSchema,
  findAdminBooksResponseBodyDtoSchema,
} from './schemas/findBooksSchema.js';
import {
  updateBookPathParamsDtoSchema,
  updateBookBodyDtoSchema,
  type UpdateBookBodyDto,
  type UpdateBookPathParamsDto,
  updateBookResponseBodyDtoSchema,
  type UpdateBookResponseBodyDto,
} from './schemas/updateBookSchema.js';

export class BookAdminHttpController implements HttpController {
  public readonly basePath = '/admin/books';
  public readonly tags = ['Book'];

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    private readonly updateBookCommandHandler: UpdateBookCommandHandler,
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
              description: 'Book created',
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: 'Create book',
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':bookId',
        handler: this.deleteBook.bind(this),
        schema: {
          request: {
            pathParams: deleteBookPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              schema: deleteBookResponseBodyDtoSchema,
              description: 'Book deleted',
            },
          },
        },
        securityMode: securityModes.bearerToken,
        description: 'Delete book',
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':bookId',
        description: 'Update a book',
        handler: this.updateBook.bind(this),
        schema: {
          request: {
            pathParams: updateBookPathParamsDtoSchema,
            body: updateBookBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Book updated',
              schema: updateBookResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findBooks.bind(this),
        description: 'Find books',
        schema: {
          request: {
            queryParams: findAdminBooksQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findAdminBooksResponseBodyDtoSchema,
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
      expectedRole: userRoles.admin,
    });

    const { book } = await this.createBookCommandHandler.execute({
      ...bookData,
      authorIds,
      isApproved: true,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: mapBookToDto(book),
    };
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseBodyDto>> {
    const { bookId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    await this.deleteBookCommandHandler.execute({ bookId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private async updateBook(
    request: HttpRequest<UpdateBookBodyDto, undefined, UpdateBookPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    const { bookId } = request.pathParams;

    const {
      authorIds,
      format,
      imageUrl,
      categoryId,
      language,
      pages,
      publisher,
      releaseYear,
      title,
      translator,
      isApproved,
      isbn,
    } = request.body;

    const { book } = await this.updateBookCommandHandler.execute({
      bookId,
      authorIds,
      format,
      categoryId,
      imageUrl,
      language,
      pages,
      publisher,
      releaseYear,
      title,
      translator,
      isApproved,
      isbn,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: mapBookToDto(book),
    };
  }

  private async findBooks(
    request: HttpRequest<undefined, FindAdminBooksQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindAdminBooksResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    const {
      page = 1,
      pageSize = 10,
      isbn,
      title,
      isApproved,
      authorIds,
      language,
      releaseYearAfter,
      releaseYearBefore,
      sortField,
      sortOrder,
    } = request.queryParams;

    const { books, total } = await this.findBooksQueryHandler.execute({
      isbn,
      title,
      isApproved,
      authorIds,
      language,
      releaseYearAfter,
      releaseYearBefore,
      page,
      pageSize,
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
