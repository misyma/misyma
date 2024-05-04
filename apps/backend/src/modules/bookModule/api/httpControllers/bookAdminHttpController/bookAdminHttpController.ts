import { UserRole } from '@common/contracts';

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
  updateBookPathParamsDtoSchema,
  updateBookBodyDtoSchema,
  type UpdateBookBodyDto,
  type UpdateBookPathParamsDto,
  updateBookResponseBodyDtoSchema,
  type UpdateBookResponseBodyDto,
} from './schemas/updateBookSchema.js';
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
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { type UpdateBookCommandHandler } from '../../../application/commandHandlers/updateBookCommandHandler/updateBookCommandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';
import { type BookDto } from '../common/bookDto.js';

export class BookAdminHttpController implements HttpController {
  public readonly basePath = '/api/admin/books';
  public readonly tags = ['Book'];

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    private readonly updateBookCommandHandler: UpdateBookCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseBodyDtoSchema,
              description: 'Book created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create book',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteBook.bind(this),
        schema: {
          request: {
            pathParams: deleteBookPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookResponseBodyDtoSchema,
              description: 'Book deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete book',
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        description: 'Update a book',
        handler: this.updateBook.bind(this),
        schema: {
          request: {
            pathParams: updateBookPathParamsDtoSchema,
            body: updateBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Book updated',
              schema: updateBookResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDto>> {
    const { authorIds, ...bookData } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { book } = await this.createBookCommandHandler.execute({
      ...bookData,
      authorIds,
      isApproved: true,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookToBookDto(book),
    };
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseBodyDto>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.deleteBookCommandHandler.execute({ bookId: id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async updateBook(
    request: HttpRequest<UpdateBookBodyDto, undefined, UpdateBookPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { authorIds, format, imageUrl, language, pages, publisher, releaseYear, title, translator } = request.body;

    const { book } = await this.updateBookCommandHandler.execute({
      bookId: id,
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
      body: this.mapBookToBookDto(book),
    };
  }

  private mapBookToBookDto(book: Book): BookDto {
    const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
      book.getState();

    const bookDto: BookDto = {
      id: book.getId(),
      title,
      language,
      format,
      isApproved,
      authors: book.getAuthors().map((author) => ({
        id: author.getId(),
        name: author.getName(),
        isApproved: author.getIsApproved(),
      })),
    };

    if (isbn) {
      bookDto.isbn = isbn;
    }

    if (publisher) {
      bookDto.publisher = publisher;
    }

    if (releaseYear) {
      bookDto.releaseYear = releaseYear;
    }

    if (translator) {
      bookDto.translator = translator;
    }

    if (pages) {
      bookDto.pages = pages;
    }

    if (imageUrl) {
      bookDto.imageUrl = imageUrl;
    }

    return bookDto;
  }
}
