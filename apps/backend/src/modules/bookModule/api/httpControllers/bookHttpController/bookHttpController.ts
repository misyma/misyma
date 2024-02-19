import { type BookDTO } from './schemas/bookDTO.js';
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
import {
  findBookResponseBodyDTOSchema,
  type FindBookResponseBodyDTO,
  type FindBookPathParamsDTO,
  findBookPathParamsDTOSchema,
} from './schemas/findBookSchema.js';
import {
  type UpdateBookGenresBodyDTO,
  type UpdateBookGenresOkResponseDTOSchema,
  type UpdateBookGenresPathParamsDTO,
  updateBookGenresBodyDTOSchema,
  updateBookGenresOkResponseDTOSchema,
  updateBookGenresPathParamsDTOSchema,
} from './schemas/updateBookGenresSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type DeleteBookCommandHandler } from '../../../application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler.js';
import { type UpdateBookGenresCommandHandler } from '../../../application/commandHandlers/updateBookGenresCommandHandler/updateBookGenresCommandHandler.js';
import { type FindBookQueryHandler } from '../../../application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';

export class BookHttpController implements HttpController {
  public readonly basePath = '/api/books';

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly updateBookGenresCommandHandler: UpdateBookGenresCommandHandler,
    private readonly deleteBookCommandHandler: DeleteBookCommandHandler,
    private readonly findBookQueryHandler: FindBookQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'create',
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseBodyDTOSchema,
              description: 'Book created.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Create book.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookResponseBodyDTOSchema,
              description: 'Book found.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Find book by id.',
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
              description: 'Book deleted.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Book'],
        description: 'Delete book.',
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':bookId/genres',
        description: 'Update Book Genres.',
        handler: this.updateBookGenres.bind(this),
        schema: {
          request: {
            pathParams: updateBookGenresPathParamsDTOSchema,
            body: updateBookGenresBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Book genres updated.',
              schema: updateBookGenresOkResponseDTOSchema,
            },
          },
        },
        tags: ['Book'],
      }),
    ];
  }

  private async updateBookGenres(
    request: HttpRequest<UpdateBookGenresBodyDTO, undefined, UpdateBookGenresPathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateBookGenresOkResponseDTOSchema>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookId } = request.pathParams;

    const { genreIds } = request.body;

    const { book } = await this.updateBookGenresCommandHandler.execute({
      bookId,
      genreIds,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookToBookDTO(book),
    };
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDTO>> {
    const { authorIds, ...bookData } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { book } = await this.createBookCommandHandler.execute({
      ...bookData,
      authorIds,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookToBookDTO(book),
    };
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParamsDTO>,
  ): Promise<HttpOkResponse<FindBookResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { book } = await this.findBookQueryHandler.execute({ bookId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookToBookDTO(book),
    };
  }

  private async deleteBook(
    request: HttpRequest<undefined, undefined, DeleteBookPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteBookResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteBookCommandHandler.execute({ bookId: id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapBookToBookDTO(book: Book): BookDTO {
    const bookDto: BookDTO = {
      id: book.getId(),
      title: book.getTitle(),
      language: book.getLanguage(),
      format: book.getFormat(),
      status: book.getStatus(),
      bookshelfId: book.getBookshelfId(),
      authors: book.getAuthors().map((author) => ({
        firstName: author.getFirstName(),
        id: author.getId(),
        lastName: author.getLastName(),
      })),
      genres: book.getGenres().map((genre) => genre.getState()),
    };

    const isbn = book.getIsbn();

    if (isbn) {
      bookDto.isbn = isbn;
    }

    const publisher = book.getPublisher();

    if (publisher) {
      bookDto.publisher = publisher;
    }

    const releaseYear = book.getReleaseYear();

    if (releaseYear) {
      bookDto.releaseYear = releaseYear;
    }

    const translator = book.getTranslator();

    if (translator) {
      bookDto.translator = translator;
    }

    const pages = book.getPages();

    if (pages) {
      bookDto.pages = pages;
    }

    const frontCoverImageUrl = book.getFrontCoverImageUrl();

    if (frontCoverImageUrl) {
      bookDto.frontCoverImageUrl = frontCoverImageUrl;
    }

    const backCoverImageUrl = book.getBackCoverImageUrl();

    if (backCoverImageUrl) {
      bookDto.backCoverImageUrl = backCoverImageUrl;
    }

    return bookDto;
  }
}
