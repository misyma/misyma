import { UserRole } from '@common/contracts';

import {
  createBookBodyDTOSchema,
  createBookResponseBodyDTOSchema,
  type CreateBookBodyDTO,
  type CreateBookResponseBodyDTO,
} from './schemas/createBookSchema.js';
import {
  deleteBookPathParamsDTOSchema,
  deleteBookResponseBodyDTOSchema,
  type DeleteBookPathParamsDTO,
  type DeleteBookResponseBodyDTO,
} from './schemas/deleteBookSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpNoContentResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';
import { type BookDTO } from '../common/bookDto.js';

export class BookAdminHttpController implements HttpController {
  public readonly basePath = '/api/admin/books';
  public readonly tags = ['Book', 'Admin'];

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseBodyDTOSchema,
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
            pathParams: deleteBookPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBookResponseBodyDTOSchema,
              description: 'Book deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete book',
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDTO>> {
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
      body: this.mapBookToBookDTO(book),
    };
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseBodyDTO>> {
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

  private mapBookToBookDTO(book: Book): BookDTO {
    const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
      book.getState();

    const bookDto: BookDTO = {
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
